import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const getLocations = async (req: Request, res: Response) => {
  try {
    // Get all locations from the database
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug, timezone')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch locations',
        error: error.message
      });
    }

    return res.json({
      success: true,
      locations: data || [],
      total: data ? data.length : 0
    });

  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unexpected error fetching locations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
