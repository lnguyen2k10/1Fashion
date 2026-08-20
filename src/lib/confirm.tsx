import toast from 'react-hot-toast';
import React from 'react'

export const confirmAction = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 p-4`}
      >
        <div className="flex-1 w-0 p-2">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <div className="flex border-t border-gray-100 mt-2 pt-2 gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            className="border border-zinc-200 rounded-lg px-4 py-2 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            className="border border-transparent rounded-lg px-4 py-2 flex items-center justify-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  });
};
