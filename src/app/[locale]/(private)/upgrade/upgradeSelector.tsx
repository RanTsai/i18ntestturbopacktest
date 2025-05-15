"use client";
import React from 'react'
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/app/interfaces';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';


function UpgradeSelector({ subscriptions }: { subscriptions: IProduct[] }) {
  const t = useTranslations();
  const [selected, setSelected] = React.useState({ credits: 1000, price: 5 });
  const user = userGlobalStore() as IUserGlobalStore;

  return (
    <>
      <div>
        <h1>{t("subscription.cardheader")}</h1>
        <p>{JSON.stringify(subscriptions)}</p>

        <Card>
          <CardHeader>
            <CardTitle>{t("subscription.upgrade")}</CardTitle>
            <p className="text-center">
              {t("subscription.credit_balance")}<span className="font-bold text-primary">{user.theUser.credit_balance}</span>  {t("subscription.credits")}
            </p>
            <CardDescription>{t("subscription.cardmessage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 justify-between mb-6">
              {subscriptions.map((product: IProduct) => (
                <Button key={product.product_id} >


                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
    </>)

}

export default UpgradeSelector