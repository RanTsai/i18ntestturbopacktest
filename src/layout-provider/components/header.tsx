import React from 'react'
import { Menu } from 'lucide-react'
// import { Button } from '@/components/ui/button'

function Header(){
// function Header({ user }: { user: IUser }) {
    //const [openMenuItems, setOpenMenuItems] = React.useState(false);

    return (
        <div className="bg-primary p-5 flex justify-between items-center">
            <div className='p-2 rounded-full flex items-center  bg-white'>
                <img
                    src="/globe.svg"
                    className='w-10 h-10 object-contain' />
            </div>
            <div className='flex items-center gap-5'>
                {/* <h1 className="text-sm text-white">{user.name}</h1>
                <Button onClick={() => setOpenMenuItems(true)}>
                    <Menu
                        size={14}
                        className='text-white cursor-pointer' />
                </Button> */}
            </div>
{/* 
            {openMenuItems && (
                <MenuItems
                    openMenuItems={openMenuItems}
                    setOpenMenuItems={setOpenMenuItems}
                />
            )} */}
        </div>
    )
}

export default Header