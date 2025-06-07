import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Book a consultation
router.post('/book', async (req: Request, res: Response) => {
  const { name, email, company, employeeCount, message } = req.body;
  
  // TODO: Implement actual booking logic, email sending, etc.
  // For now, just acknowledge the request
  
  res.status(200).json({
    success: true,
    message: 'Consultation request received. We will contact you within 24 hours.',
    booking: {
      name,
      email,
      company,
      employeeCount,
      requestedAt: new Date().toISOString(),
    },
  });
});

// Get available consultation slots
router.get('/slots', async (req: Request, res: Response) => {
  // TODO: Implement calendar integration
  // For now, return mock data
  
  const slots = [];
  const startDate = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add morning and afternoon slots
    slots.push({
      date: date.toISOString().split('T')[0],
      times: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    });
  }
  
  res.json({ slots });
});

export default router; 