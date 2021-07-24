import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import MultiSelect from 'react-multi-select-component';

const TableModal = (props) => {
  // const [open, setOpen] = useState(true)
  const {
    is_modal_show,
    setModalShow,
    modal_content,
    setModalContent,
    availUsers,
    onModalSubmit
  } = props;

  const [multiOptions, setMultiOptions] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!availUsers || availUsers.length == 0) return;
    setMultiOptions(availUsers.map(user => { return { label: user.username, value: user.id } }));
  }, [availUsers]);

  useEffect(() => {
    if (!modal_content) return;
    if (modal_content.assignees.length != 0 && modal_content.assignees[0].hasOwnProperty('username')) {
      let assignees = modal_content.assignees.map(user => { return { label: user.username, value: user.id } });
      modal_content.assignees = assignees;
    }
    setReload(!reload);
  }, [modal_content.assignees]);

  const handleChange = (name, value) => {
    setModalContent({ ...modal_content, [name]: value, });
  };

  const cancelButtonRef = useRef(null)

  return <>
    <Transition.Root show={is_modal_show} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        open={is_modal_show}
        onClose={() => setModalShow(false)}
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <input
                        type="text"
                        value={modal_content.name || ''} onChange={(e) => handleChange('name', e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input name ..."
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 items-center gap-3">
                  <div className="text-sm text-gray-500">
                    <MultiSelect
                      options={multiOptions}
                      value={modal_content.assignees}
                      onChange={val => handleChange('assignees', val)}
                      labelledBy="Select"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={() => onModalSubmit(modal_content)}
                >Submit</button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setModalShow(false)}
                  ref={cancelButtonRef}
                >Cancel</button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  </>
};

export default TableModal;
