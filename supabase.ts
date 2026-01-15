
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
          created_at: new Date(order.timestamp).toISOString(),
          coupon_code: order.couponCode
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Database Sync Exception:', err);
    return { success: false, error: err };
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
      timestamp: new Date(o.created_at).getTime(),
      couponCode: o.coupon_code
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
      reviews: p.reviews,
      isHidden: p.is_hidden,
      isSoldOut: p.is_sold_out
    }));
  } catch (err) {
    console.error('Products Fetch Failed:', err);
    return null;
  }
};

export const subscribeToOrders = (onChange: (payload: any) => void) => {
  return supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onChange(payload);
      }
    )
    .subscribe();
};

export const subscribeToProducts = (onChange: () => void) => {
  return supabase
    .channel('custom-products-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        onChange();
      }
    )
    .subscribe();
};

export const addProductToDb = async (product: any) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          image: product.image,
          size: product.size,
          is_popular: product.isPopular,
          is_quote_required: product.isQuoteRequired,
          is_contact_only: product.isContactOnly,
          is_model_required: product.isModelRequired,
          is_universal_model: product.isUniversalModel,
          is_hidden: product.isHidden,
          is_sold_out: product.isSoldOut,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Add Product Failed:', err);
    throw err;
  }
};

export const updateProductInDb = async (id: string, updates: any) => {
  try {
    // Convert camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.size !== undefined) dbUpdates.size = updates.size;
    if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;
    if (updates.isQuoteRequired !== undefined) dbUpdates.is_quote_required = updates.isQuoteRequired;
    if (updates.isContactOnly !== undefined) dbUpdates.is_contact_only = updates.isContactOnly;
    if (updates.isModelRequired !== undefined) dbUpdates.is_model_required = updates.isModelRequired;
    if (updates.isUniversalModel !== undefined) dbUpdates.is_universal_model = updates.isUniversalModel;
    if (updates.isHidden !== undefined) dbUpdates.is_hidden = updates.isHidden;
    if (updates.isSoldOut !== undefined) dbUpdates.is_sold_out = updates.isSoldOut;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Update Product Failed:', err);
    return false;
  }
};

export const deleteProductFromDb = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
};

export const uploadProductImage = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};




export const fetchCouponsFromDb = async () => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('code', { ascending: true });

    if (error) throw error;

    return data.map((c: any) => ({
      code: c.code,
      discountPercentage: c.discount_percentage,
      isActive: c.is_active,
      maxUses: c.max_uses,
      timesUsed: c.times_used || 0
    }));
  } catch (err) {
    console.error('Fetch Coupons Failed:', err);
    return [];
  }
};

export const addCouponToDb = async (coupon: any) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .insert([{
        code: coupon.code,
        discount_percentage: coupon.discountPercentage,
        is_active: coupon.isActive,
        max_uses: coupon.maxUses,
        times_used: 0
      }]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Add Coupon Failed:', err);
    return false;
  }
};

export const deleteCouponFromDb = async (code: string) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('code', code);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Delete Coupon Failed:', err);
    return false;
  }
};

export const incrementCouponUsage = async (code: string) => {
  try {
    // We can use RPC or simple fetch-update. 
    // Simple fetch-update is prone to race conditions but RPC needs SQL setup.
    // For now, let's try RPC 'increment_coupon' if it existed, but since I can't guarantee, I'll do read-modify-write.
    // Wait, supabase supports .rpc() easily if I defined it.
    // I can stick to a simpler approach: 
    // const { data } = await supabase.from('coupons').select('times_used').eq('code', code).single();
    // await supabase.from('coupons').update({ times_used: (data.times_used || 0) + 1 }).eq('code', code);

    // Better: if I can run SQL.
    // I'll stick to read-modify-write for this simple MVP.
    const { data: current, error: fetchError } = await supabase
      .from('coupons')
      .select('times_used')
      .eq('code', code)
      .single();

    if (fetchError || !current) return;

    await supabase
      .from('coupons')
      .update({ times_used: (current.times_used || 0) + 1 })
      .eq('code', code);

  } catch (err) {
    console.error('Increment Coupon Failed:', err);
  }
};
