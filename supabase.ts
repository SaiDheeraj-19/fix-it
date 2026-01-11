
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://geozgpaobcptvkgdrviw.supabase.co';
const supabaseAnonKey = 'sb_publishable_nTC0FN2_1JvyJbFDwVKMrw_FHf-NbMD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const syncOrderToDb = async (order: any) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          id: order.id,
          customer_name: order.customerName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          total: order.total,
          payment_mode: order.paymentMode,
          status: order.status,
          items: order.items,
          created_at: new Date(order.timestamp).toISOString()
        }
      ]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Database Sync Failed:', err);
    return null;
  }
};

export const fetchOrdersFromDb = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((o: any) => ({
      id: o.id,
      customerName: o.customer_name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      total: o.total,
      paymentMode: o.payment_mode,
      status: o.status,
      items: o.items,
      timestamp: new Date(o.created_at).getTime()
    }));
  } catch (err) {
    console.error('Database Fetch Failed:', err);
    return null;
  }
};

export const updateOrderStatusInDb = async (id: string, status: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Update Failed:', err);
    return false;
  }
};

export const deleteOrderFromDb = async (id: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Delete Failed:', err);
    return false;
  }
};

export const fetchProductsFromDb = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      size: p.size,
      isPopular: p.is_popular,
      isQuoteRequired: p.is_quote_required,
      isContactOnly: p.is_contact_only,
      isModelRequired: p.is_model_required,
      isUniversalModel: p.is_universal_model,
      rating: p.rating,
      reviews: p.reviews
    }));
  } catch (err) {
    console.error('Products Fetch Failed:', err);
    return null;
  }
};

export const subscribeToOrders = (onChange: () => void) => {
  return supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {
        onChange();
      }
    )
    .subscribe();
};
