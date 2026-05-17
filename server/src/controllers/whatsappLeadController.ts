import WhatsAppLead from '../models/WhatsAppLead';
import * as factory from './factory';

export const getAll = factory.getAll(WhatsAppLead, ['name', 'phone']);
export const getOne = factory.getOne(WhatsAppLead);
export const createOne = factory.createOne(WhatsAppLead);
export const updateOne = factory.updateOne(WhatsAppLead);
export const deleteOne = factory.deleteOne(WhatsAppLead);
