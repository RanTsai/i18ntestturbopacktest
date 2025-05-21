"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import toast from 'react-hot-toast';
// import { deleteProductById, getProductsBySellerId } from '@/actions/products';
import Spinner from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import dayjs from "dayjs";
import { Pencil, Trash2 } from 'lucide-react';
import { IUserCreditHistory } from '@/app/interfaces';
import { GetUserCreditHistoryFromSupabase } from '@/actions/supabaseCredits';


export default function CreditHistory() {
    const [creditHistory, setCreditHistory] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: any = await GetUserCreditHistoryFromSupabase();
            if (response.data) {
                {
                    console.log(response.data);
                    setCreditHistory(response.data);
                }
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Failed to fetch credit history");
        } finally {
            setLoading(false);
        }
    }

     React.useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        'ID',
        'Date',
        'ActionType',
        'Description',
        'Usage',
        'Credit',
        
        'Balance'
    ]
  return (
      <div>
            <div className='flex justify-between items-center'>
                <Button>
                    <Link href='/seller/products/add'>
                        Add Product
                    </Link>
                </Button>
            </div>

            {loading && <Spinner height={150} />}
            {!loading && creditHistory.length > 0 && (
                <Table className='mt-7'>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader className="bg-gray-200">
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index} className="font-bold">{column}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {creditHistory.map((creditHistory: IUserCreditHistory) => (
                            <TableRow key={creditHistory.public_id}>
                                <TableCell className='font-medium'>{creditHistory.public_id}</TableCell>
                                <TableCell className='font-medium'>{dayjs(creditHistory.created_at).format("MMMM DD, YYYY hh:mm A")}</TableCell>
                                <TableCell className='font-medium'>{creditHistory.action_type}</TableCell>
                                <TableCell className='font-medium'>{creditHistory.description}</TableCell>
                                <TableCell >-{creditHistory.debit_amount}</TableCell>
                                <TableCell >{creditHistory.credit_amount}</TableCell>
                                <TableCell >{creditHistory.balance}</TableCell>                                
                                <TableCell className="flex gap-5 items-center">
                                    <Button size={"icon"} variant={"secondary"} className='cursor-pointer'>
                                        <Trash2 size={14} />
                                    </Button>

                                    <Button size={"icon"} variant={"secondary"} className='cursor-pointer'>
                                        <Link href={`/seller/products/edit/${creditHistory.public_id}`}>
                                            <Pencil size={14} />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>)}
        </div>
  )

 
}

