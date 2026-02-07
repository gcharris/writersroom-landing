// Beta Signup Modal
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://closedclaw.kogn.ist';

function openModal() {
    const modal = document.getElementById('signup-modal');
    const form = document.getElementById('signup-form');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    // Reset state
    if (form) form.classList.remove('hidden');
    if (successMsg) successMsg.classList.add('hidden');
    if (errorMsg) errorMsg.classList.add('hidden');
    if (form) form.reset();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('signup-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

async function submitApplication(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const data = {
        display_name: form.display_name.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim() || null,
        product_interest: form.product_interest.value,
    };

    try {
        const response = await fetch(`${API_BASE}/api/v1/onboarding/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            form.classList.add('hidden');
            successMsg.classList.remove('hidden');
        } else if (response.status === 409) {
            const errorData = await response.json();
            // Check if this is a "you already have access" message (positive outcome)
            if (errorData.detail && errorData.detail.includes('already have access')) {
                // Show as success since we resent the welcome email
                document.querySelector('#success-message h3').textContent = 'Welcome Back!';
                document.querySelector('#success-message p').textContent = errorData.detail;
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
            } else {
                // Show as info message (pending review, etc.)
                errorText.textContent = errorData.detail || 'An application has already been submitted with this email address.';
                form.classList.add('hidden');
                errorMsg.classList.remove('hidden');
            }
        } else if (response.status === 422) {
            const errorData = await response.json();
            const detail = errorData.detail;
            if (Array.isArray(detail) && detail.length > 0) {
                errorText.textContent = detail[0].msg || 'Please check your input and try again.';
            } else {
                errorText.textContent = 'Please check your input and try again.';
            }
            form.classList.add('hidden');
            errorMsg.classList.remove('hidden');
        } else {
            errorText.textContent = 'Something went wrong. Please try again later.';
            form.classList.add('hidden');
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorText.textContent = 'Network error. Please check your connection and try again.';
        form.classList.add('hidden');
        errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Wire up CTA buttons
    document.querySelectorAll('a.btn-primary, a[href="#"]').forEach(btn => {
        if (btn.textContent.includes('Apply') || btn.textContent.includes('Access')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close modal on backdrop click
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'signup-modal') closeModal();
        });
    }
});