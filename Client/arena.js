// טען מידע על קרבות יומיים
async function loadDailyBattlesInfo() {
  try {
    const res = await fetch('/api/daily-battles');
    if (!res.ok) {
      throw new Error('Failed to fetch daily battles');
    }
    const data = await res.json();
    updateBattlesRemainingDisplay(data.remaining);
    return data;
  } catch (error) {
    console.error('Error loading daily battles info:', error);
    // במקרה של שגיאה, הצג הודעה ברירת מחדל
    updateBattlesRemainingDisplay(5);
    return { remaining: 5, canBattle: true };
  }
}

// עדכון הצגת קרבות שנשארו
function updateBattlesRemainingDisplay(remaining) {
  const battlesInfo = document.getElementById('battles-remaining');
  if (battlesInfo) {
    if (remaining === undefined || remaining === null) {
      battlesInfo.textContent = 'Unable to load battle info';
      battlesInfo.style.color = '#f44336';
    } else {
      battlesInfo.textContent = `You have ${remaining} battles remaining today`;
      battlesInfo.style.color = remaining > 0 ? '#2e7d32' : '#f44336';
    }
  }
}

// טען את המשתמש הנוכחי
async function loadCurrentUser() {
  try {
    const res = await fetch('/api/me');
    const user = await res.json();
    currentUser = user;
    
    // טען מידע על קרבות יומיים
    await loadDailyBattlesInfo();
    
  } catch (error) {
    console.error('Error loading current user:', error);
  }
}

// טען מידע כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
  // נסה לטעון מידע על קרבות יומיים
  loadDailyBattlesInfo().catch(error => {
    console.error('Failed to load daily battles info:', error);
    updateBattlesRemainingDisplay(5); // ברירת מחדל
  });
}); 