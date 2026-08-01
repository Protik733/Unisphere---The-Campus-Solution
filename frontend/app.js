// ==========================================
// 📌 BASE CONFIGURATION
// ==========================================
// Vercel/Render-এ ডিপ্লয় করার পর এই লোকালহোস্ট লিংকের জায়গায় আপনার লাইভ API লিংক বসাতে হবে
const API_URL = window.API_BASE + "/api/auth";

// ==========================================
// 📌 UI NAVIGATION LOGIC (লগইন ও সাইন-আপ ফর্ম বদলানো)
// ==========================================
function switchForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    const toggleBtns = document.getElementById('toggleBtns');

    loginForm.classList.toggle('hidden', formType === 'signup');
    signupForm.classList.toggle('hidden', formType === 'login');
    forgotForm.classList.add('hidden');

    document.getElementById('loginBtn').classList.toggle('active', formType === 'login');
    document.getElementById('signupBtn').classList.toggle('active', formType === 'signup');

    toggleBtns.classList.remove('hidden');
}

function showForgotForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('forgotForm').classList.remove('hidden');
    document.getElementById('toggleBtns').classList.add('hidden');
}

// ==========================================
// 📌 AUTHENTICATION LOGIC (লগইন এবং সাইন-আপ প্রসেস)
// ==========================================

// ১. Send OTP (Signup)
async function sendOtp() {
    const email = document.getElementById('signupEmail').value;
    const uid = document.getElementById('signupUid').value;

    if(!email || !uid) {
        alert("Please enter Email and UID/Roll Number!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
    email,
    uid,
    role: document.getElementById("signupRole").value
})
        });

        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('step1').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
            alert("OTP sent successfully to your email!");
        } else {
            alert(data.message);
        }
    } catch(err) {
        alert("Server error! Please check if backend is running.");
    }
}

// ২. Verify OTP & Create Profile
async function verifyAndCreate() {
    const userData = {
        role: document.getElementById('signupRole').value,
        name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        uid: document.getElementById('signupUid').value,
        mobile: document.getElementById('signupPhone').value,
        otp: document.getElementById('otpCode').value,
        password: document.getElementById('signupPassword').value
    };

    try {
        const res = await fetch(`${API_URL}/verify-and-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (res.ok) {
            data.user.isSuperAdmin = data.isSuperAdmin;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert("Profile created successfully!");

            const role = document.getElementById('signupRole').value;
            
            // রোল অনুযায়ী সঠিক ফোল্ডারে রিডাইরেক্ট (Redirection Fixed)
            if (role === "student") {
                window.location.href = "./student/dashboard.html";
            } else if (role === "canteen_authority") {
                window.location.href = "./canteen/canteen.html";
            } else if (role === "report_cell") {
                window.location.href = "./report/report.html";
            } else {
                window.location.href = "./student/dashboard.html"; 
            }
        } else {
            alert(data.message);
        }
    } catch(err) {
        alert("Verification failed! Server error.");
    }
}

// ৩. Login Flow
// ৩. Login Flow
document.getElementById('loginForm').addEventListener('submit', async (e) => {

    e.preventDefault();

    const loginData = {

        role: document.getElementById('loginRole').value,
        loginKey: document.getElementById('loginKey').value,
        password: document.getElementById('loginPassword').value

    };


    try {

        const res = await fetch(`${API_URL}/login-secure`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(loginData)

        });


        const data = await res.json();


        if (res.ok) {


            data.user.isSuperAdmin = data.isSuperAdmin;


            localStorage.setItem(
                'token',
                data.token
            );


            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );



            // ============================
            // SUPER ADMIN ACCESS
            // ============================

            if(data.isSuperAdmin){


                if(loginData.role === "student"){

                    window.location.href =
                    "./student/dashboard.html";

                }


                else if(loginData.role === "canteen_authority"){

                    window.location.href =
                    "./canteen/canteen.html";

                }


                else if(loginData.role === "report_cell"){

                    window.location.href =
                    "./report/report.html";

                }


                else if(loginData.role === "driver"){

                    window.location.href =
                    "./driver/dashboard.html";

                }


                return;

            }



            // ============================
            // NORMAL USER REDIRECT
            // ============================

            const role = data.user.role;


            if(role === "student"){

                window.location.href =
                "./student/dashboard.html";

            }

            else if(role === "canteen_authority"){

                window.location.href =
                "./canteen/canteen.html";

            }

            else if(role === "report_cell"){

                window.location.href =
                "./report/report.html";

            }

            else if(role === "driver"){

                window.location.href =
                "./driver/dashboard.html";

            }

            else{

                alert("Unknown role!");

            }


        }

        else {

            alert(data.message);

        }


    }

    catch(err){

        console.log(err);

        alert("Login failed! Server error.");

    }

});
// ==========================================
// 📌 FORGOT PASSWORD LOGIC
// ==========================================

// ১. Send OTP for Password Reset
async function sendForgotOtp() {
    const email = document.getElementById('forgotEmail').value;

    if (!email) {
        alert("Please enter your registered email!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/forgot-password-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            // Step 1 লুকিয়ে Step 2 (OTP ও পাসওয়ার্ড বক্স) দেখানো
            document.getElementById('forgotStep1').classList.add('hidden');
            document.getElementById('forgotStep2').classList.remove('hidden');
            alert("Password reset OTP sent to your email!");
        } else {
            alert(data.message); // ইমেইল না পেলে এরর দেখাবে
        }
    } catch (err) {
        alert("Server error! Please check if backend is running.");
    }
}

// ২. Verify OTP & Set New Password
async function resetPassword() {
    const email = document.getElementById('forgotEmail').value;
    const otp = document.getElementById('forgotOtpCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!otp || !newPassword || !confirmNewPassword) {
        alert("Please fill all fields!");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Password reset successful! You can now login.");
            
            // সবকিছু রিসেট করে আবার লগইন পেজে ফিরিয়ে আনা
            document.getElementById('forgotForm').reset();
            document.getElementById('forgotStep2').classList.add('hidden');
            document.getElementById('forgotStep1').classList.remove('hidden');
            switchForm('login');
        } else {
            alert(data.message); // OTP ভুল হলে এরর দেখাবে
        }
    } catch (err) {
        alert("Reset failed! Server error.");
    }
}