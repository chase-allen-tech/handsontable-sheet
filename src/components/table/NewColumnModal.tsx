import React, { Fragment, useRef, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { COL_MODE_ICON, COL_MODE_LONG, COL_MODE_REL, COL_MODE_TEXT, COL_MODE_UPLOAD } from '../../constants/config';

const NewColumnModal = (props) => {
  // const [open, setOpen] = useState(true)
  const {
    is_modal_show,
    setModalShow,
    modal_content,
    setModalContent,
    modal_category,
    setModalCategory, 
    modal_target_table_id,
    setModalTargetTableId,
    modal_target_col_name,
    setModalTargetColName,
    onModalSubmit,
    onModalCancel,
    relation_list,
  } = props;

  const cancelButtonRef = useRef(null)
  return <>
    <Transition.Root show={is_modal_show} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-20 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        open={is_modal_show}
        onClose={onModalCancel}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
                    </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <input
                        type="text"
                        name="content"
                        id="content"
                        value={modal_content || ''} onChange={(e) => setModalContent(e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 border focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input name ..."
                      />
                    </div>
                  </div>
                </div>
                <select
                  id="location"
                  name="location"
                  onChange={(e) => setModalCategory(e.target.value)}
                  value={modal_category}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value={COL_MODE_TEXT}>Simple Text</option>
                  <option value={COL_MODE_LONG}>Long Text</option>
                  <option value={COL_MODE_ICON}>Icon</option>
                  <option value={COL_MODE_REL}>Relationship</option>
                  <option value={COL_MODE_UPLOAD}>Upload</option>
                </select>
                {
                  modal_category == COL_MODE_REL &&
                  <select
                    id="rel_table"
                    name="rel_table"
                    onChange={(e) => setModalTargetTableId(e.target.value)}
                    value={modal_target_table_id}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="DEFAULT" hidden>Choose a Reference Table...</option>
                    {
                      relation_list.map(rel => (
                        <option key={rel.table_uuid} value={rel.table_uuid}>{rel.table_name}</option>
                      ))
                    }

                  </select>
                }
                {
                  modal_category == COL_MODE_REL &&
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <input
                        type="text"
                        name="col_name"
                        id="col_name"
                        value={modal_target_col_name || ''} onChange={(e) => setModalTargetColName(e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 border focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input name ..."
                      />
                    </div>
                  </div>
                }

              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={onModalSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={onModalCancel}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  </>
};

export default NewColumnModal;
