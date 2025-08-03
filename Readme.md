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
    "message" : "This is Test Message"
}


<-- newsletter API (Before and After Login No Authorization Token Required) -->

POST /api/newsletter

{
    "email" : "techboy9797@gmail.com",
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
POST /api/auth/resetpassword
{
    "email" : "anuragkumar@gmail.com",
    "password" : "test@1234"
}

<-- Profile Update (After Login and Authorizatio Token Required)--> 

1.> verify user email

POST /api/user/auth/verify-user-email
{
    "email" : "anuragkumarsingh154@gmail.com"
}

2.> verify user email OTP

POST /api/user/auth/verify-user-email-otp
{
    "otp" : "283748"
}

3.> Delete user account 

POST /api/user/auth/delete-user
{
    Nothing is required
}

4.> Manage Two Factor Auth
POST /api/user/auth/manage-twofactor-auth
{
    "twoFactorAuth" : "false"
}

Frontend Fix notes

1. Fix username length in navbar
2. Logout user when there is User not registered response
3. Fix mobile number length in account settings