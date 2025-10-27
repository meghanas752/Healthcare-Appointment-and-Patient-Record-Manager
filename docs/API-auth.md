# Auth API (Scaffold)
**POST** `/api/auth/login`  
Body: `{ "username": "string", "password": "string" }`

Responses (planned):
- `200` `{ ok:true, token, user }`
- `401` `{ ok:false, msg:"Invalid credentials" }`
- `423` `{ ok:false, lockedUntil: "ISO-8601" }`  <!-- account locked -->
