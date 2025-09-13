import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const parseLimit = (value: any, fallback: number, max: number) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(Math.max(1, Math.trunc(n)), max);
};

export const getLabels = async (req: Request, res: Response) => {
	try {
		const query = (req.query.query as string | undefined)?.trim() || '';
		const limit = parseLimit(req.query.limit, 10, 100);

		let request = supabaseAdmin
			.from('labels')
			.select('id, location_id, code, name, synonyms, active')
			.eq('active', true)
			.limit(limit);

		if (query) {
			const pattern = `%${query}%`;
			request = request.or(
				`name.ilike.${pattern},code.ilike.${pattern},synonyms.ilike.${pattern}`
			);
		}

		const { data, error } = await request.order('name', { ascending: true });
		if (error) {
			return res.status(500).json({ success: false, message: 'Failed to fetch labels', error: error.message });
		}

		return res.json({ 
			success: true, 
			labels: data || [],
			total: data ? data.length : 0
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Unexpected error fetching labels',
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};


