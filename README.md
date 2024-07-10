# Doc-Care Hospital Management System

Doc-Care is a hospital management system that allows patients and doctors to manage their appointments and interactions seamlessly. This project includes backend APIs for patient and doctor management, payment processing, and password recovery functionalities.

## Endpoints

### For Patient

- `POST /api/patregister`
  - Register a new patient.
  
- `POST /api/patlogin`
  - Patient login.
  
- `GET /api/getpat`
  - Retrieve patient details.
  
- `PUT /api/updatepat/:id`
  - Update patient details by ID.
  
- `POST /api/payment/:id`
  - Process payment for a patient's appointment using Stripe.
  
- `POST /api/patlinkpassword`
  - Send a link to the patient's mobile number for password reset.
  
- `PUT /api/patresetpassword/:id/:token`
  - Reset the patient's password using the provided ID and token.

### For Doctor

- `POST /api/docregister`
  - Register a new doctor.
  
- `POST /api/doclogin`
  - Doctor login.
  
- `GET /api/getdoc/profile`
  - Retrieve the doctor's profile details.
  
- `PUT /api/updatedoc/:id`
  - Update doctor details by ID.
  
- `GET /api/getappoint`
  - Get the list of appointments for the doctor.
  
- `POST /api/resetpassword`
  - Send a link to the doctor's mobile number for password reset.
  
- `PUT /api/resetpassword/:id/:token`
  - Reset the doctor's password using the provided ID and token.

## Features

- **Patient Management**: Register, login, and manage patient details.
- **Doctor Management**: Register, login, and manage doctor details and appointments.
- **Payment Processing**: Integrated Stripe payment for seamless appointment scheduling.
- **Notifications**: Implemented Twilio for notifications.
- **Password Recovery**: Secure password recovery process for both patients and doctors.

