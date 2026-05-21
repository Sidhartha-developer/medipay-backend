const { getAdmin } = require('../config/firebase');
const logger = require('../utils/logger');

const sendToDevice = async (fcmToken, { title, body, data = {} }) => {
  if (!fcmToken) return null;
  try {
    const admin = getAdmin();
    return await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns:    { payload: { aps: { sound: 'default' } } },
    });
  } catch (err) {
    logger.error('FCM sendToDevice error:', err.message);
    return null;
  }
};

const sendToMultiple = async (tokens, payload) => {
  if (!tokens?.length) return null;
  try {
    const admin = getAdmin();
    return await admin.messaging().sendEachForMulticast({ tokens, ...payload });
  } catch (err) {
    logger.error('FCM sendToMultiple error:', err.message);
    return null;
  }
};

module.exports = { sendToDevice, sendToMultiple };
