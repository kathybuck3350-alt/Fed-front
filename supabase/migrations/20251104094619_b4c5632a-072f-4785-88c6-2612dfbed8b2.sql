-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('Standard', 'Express', 'Premium')),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  estimated_delivery DATE NOT NULL,
  shipment_value DECIMAL NOT NULL,
  current_location TEXT NOT NULL,
  customs_status TEXT NOT NULL CHECK (customs_status IN ('Cleared', 'On Hold')),
  status TEXT NOT NULL DEFAULT 'In Transit',
  progress JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users (only admins can access)
CREATE POLICY "Admin users are private" 
ON public.admin_users 
FOR ALL 
USING (false);

-- Policies for shipments (public read access for tracking, admin write access)
CREATE POLICY "Anyone can view shipments by tracking ID" 
ON public.shipments 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert shipments" 
ON public.shipments 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Only admins can update shipments" 
ON public.shipments 
FOR UPDATE 
USING (false);

CREATE POLICY "Only admins can delete shipments" 
ON public.shipments 
FOR DELETE 
USING (false);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$8K1p/a0dL3LKzDKm3qpQF.pB5Vz0KHNhF0Vr8C6QxXZzxqN1L8Xum');

-- Insert a sample shipment
INSERT INTO public.shipments (
  tracking_id, 
  service_type, 
  origin, 
  destination, 
  estimated_delivery, 
  shipment_value, 
  current_location, 
  customs_status,
  status,
  progress
) VALUES (
  'SCS-20251102-330',
  'Standard',
  'New York, USA',
  '2416 Karen Lane, Lake Charles, LA 70605',
  '2025-11-02',
  800000,
  'Kansas City, Missouri',
  'On Hold',
  'In Transit',
  '[
    {"title": "Package Received", "description": "Shipment received at origin facility", "location": "New York, USA", "timestamp": "2025-10-28T08:00:00Z", "completed": true},
    {"title": "In Transit", "description": "Package is on the way", "location": "Kansas City, Missouri", "timestamp": "2025-10-30T14:30:00Z", "completed": true},
    {"title": "Customs Clearance", "description": "Package awaiting customs clearance", "location": "Kansas City, Missouri", "timestamp": "2025-10-31T10:00:00Z", "completed": false},
    {"title": "Out for Delivery", "description": "Package will be delivered soon", "location": "Lake Charles, LA", "timestamp": null, "completed": false}
  ]'::jsonb
);