'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Pagination } from '@/components/ui/pagination';
import { IUserWork } from '@/app/interfaces';

dayjs.extend(relativeTime);

export default function MyWorkSection({ userWorks }: { userWorks: IUserWork[] }) {
  //const sectionRef = useRef<HTMLElement>(null); // ✅ 建立 ref
  const [pageSize, setPageSize] = useState<number>(10); // 預設每頁 10 筆
  const [currentPage, setCurrentPage] = useState<number>(1);
  const paginatedWorks = userWorks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  //   //sectionRef.current?.scrollIntoView({ behavior: 'smooth' }); // ✅ 滾動回頂部
  // };

  return (
    <motion.section
      //ref={sectionRef}
      className="space-y-4 min-h-[300px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold">Your Thumbnails</h2>

      {userWorks.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-0 shadow-md">
              <Skeleton className="w-full h-40" />
              <CardContent className="p-2 space-y-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 "
            >
              {paginatedWorks.map((work) => (
                <Card
                  key={work.user_work_id}
                  className="relative group overflow-hidden p-0 shadow-md 
               border-2 border-transparent hover:border-blue-500  transition-colors duration-300"
                >
                  <div className="relative">
                    <Link href={`/aichat/${work.public_id}`}>
                      <Image
                        src={work.image_url}
                        alt={work.title}
                        width={400}
                        height={300}
                        className="rounded-md w-full h-40 object-cover transform transition-transform duration-300 group-hover:scale-110"
                      />
                    </Link>
                    <Button
                      variant="default"
                      className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      AI Review
                    </Button>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      V{work.versions?.version_number ?? '—'}
                    </div>
                  </div>
                  <CardContent className="p-2 space-y-1">
                    <CardTitle>{work.title}</CardTitle>
                    <CardDescription>{work.description}</CardDescription>
                    <CardDescription>created {dayjs(work.created_at).fromNow()}</CardDescription>
                  </CardContent>
                </Card>
              ))}

            </motion.div>
          </AnimatePresence>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={userWorks.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            showPageSizeSelect
            i18n={{
              pageLabel: 'Page',
              perPageLabel: '/ page',
            }}
          />

        </>
      )}
    </motion.section>
  );
}
