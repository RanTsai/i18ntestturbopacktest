//\app\[locale]\(private)\upgrade\page.tsx
"use server"
import React from 'react'
import { getSubscriptionsFromSupabase } from '@/actions/supabase/supabaseSubscription';
import { IProduct } from '@/app/interfaces';
import UpgradeSelector from './upgradeSelector'
import PaypalProvider from '@/context/paypalprovider';
import UpgradeSelectorTemp from './upgrade-selector-temp';

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
        <PaypalProvider currency={subscriptions[0]?.currency.toUpperCase() || "USD"}>
          {/* <UpgradeSelector subscriptions={subscriptions} /> */}
          <UpgradeSelectorTemp />
        </PaypalProvider>
      </div>
    </>

  )

}

export default page