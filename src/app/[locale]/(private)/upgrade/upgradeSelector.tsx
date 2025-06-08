// \app\[locale]\(private)\upgrade\upgradeSelector.tsx
"use client";
import React from 'react'
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/app/interfaces';
import userGlobalStore, { IUserGlobalStore } from '@/lib/global-store/users-store';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/spinner';
import { savePurchaseToSupabase } from '@/actions/supabase/supabaseSubscription'

function UpgradeSelector({ subscriptions }: { subscriptions: IProduct[] }) {
  const t = useTranslations();
  const [selected, setSelected] = React.useState<IProduct>(subscriptions[0]);
  const { theUser, isInitialized, initUserIfNeeded } = userGlobalStore();

  React.useEffect(() => {
    initUserIfNeeded(true); // 預設為 true，或根據 isSignedIn 傳入
  }, [initUserIfNeeded]);

  const [{ isPending }] = usePayPalScriptReducer();
  const handleSuccess = async (details: any) => {

    if (!selected) {
      toast.error("No subscription selected");
      return;
    }

    if (!isInitialized || !theUser || isPending) {
      return <Spinner />;
    }

    const amount = parseFloat(details.purchase_units[0].value);
    const credits = parseInt(details.purchase_units[0].custom_id, 10);
    toast.success(`connecting to DB`);

    //save credit to db
    try {
      const { success, data } = await savePurchaseToSupabase(selected, theUser.credit_balance + selected.credit);
      //get user credts from db
      if (success) {
        toast.success(`Successfully purchased ${credits} credits.`);
        console.log(data);
      }
    } catch (err) {

      console.error("err->", err);
      toast.error("An error occurred. Please try again");
    }
  }

  const handleError = (err: any) => {
    console.log("err => ", err);
    toast.error("An error occurred, please try again.");
  }


  return (
    <>
      <div>
        <h1>{t("subscription.cardheader")}</h1>
        {/* <p>{JSON.stringify(subscriptions)}</p> */}

        <Card>
          <CardHeader>
            <CardTitle>{t("subscription.upgrade")}</CardTitle>
            <p className="text-center">
              {t("subscription.credit_balance")}<span className="font-bold text-primary">{theUser?.credit_balance}</span>  {t("subscription.credits")}

            </p>
            <CardDescription>{t("subscription.cardmessage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 justify-between mb-6">

              {subscriptions.map((product: IProduct) => (
                <Button
                  key={product.product_id}
                  onClick={() => setSelected(product)}
                  variant={selected?.product_id === product.product_id ? "default" : "outline"}
                  className="h-14 flex justify-between items-center"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">{product.credit} {t("subscription.credits")}</span>
                    <span className="text-sm text-muted-foreground">{product.period}</span>
                  </div>
                  <div className="font-bold text-right">
                    {product.price} {product.currency}
                  </div>
                </Button>
              ))}
            </div>

            <div className="relative z-0">
              <PayPalButtons
                key={selected.product_id}
                createOrder={(data, actions: any) => {
                  const price = selected?.price;
                  const credits = selected?.credit;

                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: selected?.currency.toUpperCase() || "USD",
                          value: price,
                        },
                        custom_id: credits,

                      },
                    ]
                  })
                }}
                onApprove={async (DataTransfer, actions: any) => {
                  const details = await actions.order.capture();
                  handleSuccess(details);
                }}
                onError={handleError}
              />

            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled={!selected}>Confirm</Button>
          </CardFooter>
        </Card>
      </div>
    </>)

}

export default UpgradeSelector