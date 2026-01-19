import re
from datetime import datetime, timedelta
from collections import defaultdict

def parse_whatsapp_chat(file_path):
    """
    Parses a WhatsApp exported chat and returns:
    - active users per day
    - new users per day
    - users active 4+ days in last 7 days
    Works dynamically with any file path.
    """

    # Date format for WhatsApp exports
    date_format = "%m/%d/%y, %I:%M %p"

    new_users_by_day = defaultdict(set)
    active_users_by_day = defaultdict(set)

    # Match lines like: 4/1/21, 9:55 PM - +91 12345: Message
    line_regex = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2}), (\d{1,2}:\d{2} (?:AM|PM)) - (.+)$')
    join_regex = re.compile(r'^(.+?) joined using this group\'s invite link$')
    msg_regex = re.compile(r'^(.+?):')  # Matches any user before the first colon

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            match = line_regex.match(line)
            if not match:
                continue

            date_str, time_str, message = match.groups()
            dt_str = f"{date_str}, {time_str}"

            try:
                dt = datetime.strptime(dt_str, date_format)
            except ValueError:
                continue

            # Check if it's a join message
            join_match = join_regex.match(message)
            if join_match:
                user = join_match.group(1).strip()
                new_users_by_day[dt.date()].add(user)
                continue

            # Check if it's a normal message
            msg_match = msg_regex.match(message)
            if msg_match:
                user = msg_match.group(1).strip()
                active_users_by_day[dt.date()].add(user)

    # Get the last 7 days based on chat data
    all_dates = list(set(list(new_users_by_day.keys()) + list(active_users_by_day.keys())))
    if all_dates:
        latest_date = max(all_dates)
    else:
        latest_date = datetime.today().date()

    last_7_days = [latest_date - timedelta(days=i) for i in range(6, -1, -1)]

    new_users_counts = [len(new_users_by_day.get(d, set())) for d in last_7_days]
    active_users_counts = [len(active_users_by_day.get(d, set())) for d in last_7_days]

    # Users active 4+ days in last 7 days
    user_activity = defaultdict(int)
    for d in last_7_days:
        for user in active_users_by_day.get(d, set()):
            user_activity[user] += 1
    active_4days = [user for user, count in user_activity.items() if count >= 4]

    dates_str = [d.strftime("%Y-%m-%d") for d in last_7_days]

    return {
        "dates": dates_str,
        "active_users_count": active_users_counts,
        "new_users_count": new_users_counts,
        "active_users_4days": active_4days
    }
