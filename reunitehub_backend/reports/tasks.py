from celery import shared_task
import time
import logging

logger = logging.getLogger(__name__)

# Mock function to simulate a real-world SMS/Email API call
def send_notification_api(recipient, message):
    """Simulates making an API call to a notification service."""
    # In a real application, this would use a library like Twilio or a local Ethiopian SMS gateway
    # time.sleep(2) # Simulate network delay
    logger.info(f"--- MOCK SMS/EMAIL API CALL ---")
    logger.info(f"Recipient: {recipient}")
    logger.info(f"Message: {message}")
    logger.info(f"-------------------------------")
    return True

@shared_task
def send_critical_alert(report_id, full_name, location):
    """
    Sends critical SMS alerts for a newly verified high-priority report.
    This task is run asynchronously by the Celery worker.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Step 1: Simulate fetching all opt-in users/volunteers for regional alerts
    # For demonstration, we'll use a hardcoded list of 'subscribers'
    subscribers = [
        'volunteer@reunitehub.org', 
        'user_a@example.com',
        '251911XXXXXX', # Mock phone number
    ]

    alert_message = (
        f"CRITICAL ALERT: Missing Person: {full_name}, last seen in {location}. "
        f"View report: http://reunitehub.org/report/{report_id}"
    )

    logger.info(f"Sending {len(subscribers)} alerts for Report ID {report_id}...")
    
    # Step 2: Iterate and send the alert (simulated)
    success_count = 0
    for recipient in subscribers:
        if send_notification_api(recipient, alert_message):
            success_count += 1
    
    logger.info(f"Task Complete: Successfully sent {success_count} alerts.")
    return f"Alerts sent for Report ID {report_id}"