"use server"
import React from 'react'
import { getSubscriptionsFromSupabase } from '@/actions/supabaseSubscription';
import { IProduct } from '@/app/interfaces';
import UpgradeSelector from './upgradeSelector'

async function page({ params }: { params: { locale: string } }) {
  let subscriptions: IProduct[] = [];

  try {
    const locale = params.locale;
    const response: any = await getSubscriptionsFromSupabase(locale);

    if (response.success && response.data) {
      subscriptions = response.data;
      console.log("loaded subscriptions", subscriptions);
    }
    else {
      console.error(response.message);
    }

  } catch (error: any) {
    throw new Error(error.message);
  }
  return (
    <>
      <div>
       <UpgradeSelector subscriptions={subscriptions}/>
      </div>
    </>

  )

}

export default page