import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { validatePhoneNumber, sendSms, isTwilioConfigured } from '../config/twilio';
import { randomUUID } from 'crypto';

interface RequestBody {
  locationId: string;
  phone: string;
  labelName?: string;
  labelId?: string;
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Use the enhanced phone validation from Twilio config
const validatePhone = (phone: string): boolean => {
  return validatePhoneNumber(phone);
};

const validateLabelName = (labelName: string): boolean => {
  return Boolean(labelName && labelName.trim().length > 0 && labelName.trim().length <= 100);
};

const uploadPhotoToSupabase = async (file: Express.Multer.File): Promise<string | null> => {
  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${randomUUID()}.${fileExt}`;
    const filePath = `requests/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Photo upload error:', error);
    return null;
  }
};

export const submitRequest = async (req: MulterRequest, res: Response) => {
  try {
    const { locationId, phone, labelName, labelId }: RequestBody = req.body;
    const image = req.file;

    // Validation
    if (!locationId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: locationId and phone are required'
      });
    }

    // Either labelName or labelId must be provided
    if (!labelName && !labelId) {
      return res.status(400).json({
        success: false,
        message: 'Either labelName or labelId must be provided'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Validate labelName if provided
    if (labelName && !validateLabelName(labelName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid labelName: must be 1-100 characters'
      });
    }

    // Validate image if provided
    if (image) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(image.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed'
        });
      }

      if (image.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'Image too large. Maximum size is 5MB'
        });
      }
    }

    // Upload image if provided
    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await uploadPhotoToSupabase(image);
      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    }

    // Save request to database
    const { data, error } = await supabaseAdmin
      .from('requests')
      .insert({
        location_id: locationId,
        text: labelName?.trim() || null,
        image_url: imageUrl,
        matched_label_id: labelId || null,
        status: 'open',
        created_at: new Date().toISOString()
      })
      .select('id, location_id, text, image_url, matched_label_id, status, created_at')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save request',
        error: error.message
      });
    }

    // Send confirmation SMS if Twilio is configured
    let smsSent = false;
    let smsError = null;
    
    if (isTwilioConfigured()) {
      try {
        const smsMessage = `Hi! Thank you for your product request. Your request ID is: ${data.id}. We have received your request and will get back to you soon. For any queries, please reference this ID.`;
        await sendSms({
          to: phone,
          body: smsMessage
        });
        smsSent = true;
        console.log(`Confirmation SMS sent to ${phone} for request ${data.id}`);
      } catch (smsErr) {
        smsError = smsErr instanceof Error ? smsErr.message : 'Unknown SMS error';
        console.error('Failed to send confirmation SMS:', smsError);
      }
    } else {
      console.warn('Twilio not configured - skipping SMS confirmation');
    }

    return res.status(200).json({
      success: true,
      message: smsSent ? 'Thanks, confirmation SMS sent.' : 'Request submitted successfully.',
      data: {
        id: data.id,
        smsSent,
        ...(smsError && { smsError })
      }
    });

  } catch (error) {
    console.error('Submit request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
