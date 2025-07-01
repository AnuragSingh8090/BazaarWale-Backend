                                                                             <-- API Documentation -->


<-- Registration API (Before Login No Authorization Token Required) -->

POST /api/auth/register 

{
    "name" : "Mukesh Kumar",
    "email" : "mukeshkumar@gmail.com",
    "password" : "anurag@1234",
    "gender": "male",
    "mobile" : "8090674332"
}


<-- login API (Before Login No Authorization Token Required)-->

POST /api/auth/login

{
    "email" : "mukeshkumar@gmail.com",
    "password" : "anurag@1234"
}


<-- contact API (Before and After Login No Authorization Token Required) -->

POST /api/contact

{
    "name" : "Anurag",
    "email" : "techboy9797@gmail.com",
    "mobile" : "8090674532",
    "messages" : "This is Test Message"
}


<-- user data API (After Login Authorization Token Required)-->

GET /api/auth/userdata

{
   header : {token}
}


<-- Reset Password API (Before Login No Authorizatio Token Required)-->

<-- Step 1 (Validate User Email Id) -->
POST /api/auth/validateresetpasswordemail
{
    "email" : "anuragkumar@gmail.com"
}

<-- Step 2 (Validate User OTP) -->
POST /api/auth/validateresetpasswordotp
{
    "email" : "anuragkumar@gmail.com",
    "otp" : "384958"
}

<-- Step 3 (Reset Password) -->
POST /api/auth/validateresetpasswordotp
{
    "email" : "anuragkumar@gmail.com",
    "password" : "test@1234"
}
