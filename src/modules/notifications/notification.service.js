const Notification = require('../../models/Notification');
const { sendToDevice } = require('../../services/fcmService');
const paginate = require('../../utils/pagination');

const getMyNotifications = async (userId, query) => {
  return paginate(Notification, { recipient: userId }, { page: query.page, limit: query.limit });
};

const markRead = async (id, userId) => {
  return Notification.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true }, { new: true });
};

const markAllRead = async (userId) => {
  return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const createAndSend = async ({ recipientId, recipientModel, fcmToken, title, body, type, data }) => {
  const notif = await Notification.create({ recipient: recipientId, recipientModel, title, body, type, data });
  if (fcmToken) await sendToDevice(fcmToken, { title, body, data: { type, ...(data || {}) } });
  return notif;
};

module.exports = { getMyNotifications, markRead, markAllRead, createAndSend };
