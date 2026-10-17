// Keep the existing Formspree destination; improve UX without changing the backend.
        const form = document.getElementById('business-form');
        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('form-status');
        if (window.fetch && window.FormData) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (submitBtn.disabled || !form.reportValidity()) return;
                statusMessage.textContent = '';
                statusMessage.className = 'form-status';
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: new FormData(form),
                        headers: { 'Accept': 'application/json' }
                    });
                    const result = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        const details = Array.isArray(result.errors)
                            ? result.errors.map((item) => item.message).filter(Boolean).join(' ')
                            : '';
                        throw new Error(details || 'Your inquiry could not be submitted. Please try again.');
                    }
                    form.reset();
                    statusMessage.className = 'form-status success';
                    statusMessage.textContent = 'Your inquiry has been submitted successfully. Our business team will review it.';
                } catch (error) {
                    statusMessage.className = 'form-status error';
                    statusMessage.textContent = error.message || 'A network error occurred. Please try again.';
                } finally {
                    submitBtn.textContent = 'Submit Advertising Inquiry';
                    submitBtn.disabled = false;
                }
            });
        }
