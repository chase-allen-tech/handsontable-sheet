import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';

import MultiSelect from 'react-multi-select-component';
import { CONST_FALSE, CONST_TRUE } from '../../constants/config';

const UserModal = (props) => {
  const {
    is_modal_show,
    setModalShow,
    modal_content,
    setModalContent,
    roles,
    tables,
    onModalSubmit
  } = props;

  // console.log('--modal--', modal_content);

  const [multiOptions, setMultiOptions] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!tables || tables.data.length == 0) return;
    setMultiOptions(tables.data.map(table => { return { label: table.name, value: table.id } }));
  }, [tables]);

  // Process modal_content data acceptable in form elements
  useEffect(() => {
    if (!modal_content) return;
    if (modal_content.tables.length != 0 && modal_content.tables[0].hasOwnProperty('name')) {
      let modal_tables = modal_content.tables.map(tbl => { return { label: tbl.name, value: tbl.id } });
      modal_content.tables = modal_tables;
    }
    if (typeof modal_content.role == 'object') { modal_content.role = modal_content.role.id; }
    if (typeof modal_content.superadmin == 'boolean') { modal_content.superadmin = modal_content.superadmin ? CONST_TRUE : CONST_FALSE; }
    if (typeof modal_content.blocked == 'boolean') { modal_content.blocked = modal_content.blocked ? CONST_TRUE : CONST_FALSE; }
    if (typeof modal_content.confirmed == 'boolean') { modal_content.confirmed = modal_content.confirmed ? CONST_TRUE : CONST_FALSE; }
    setReload(!reload);
  }, [modal_content.tables, modal_content.role, modal_content.superadmin, modal_content.blocked, modal_content.confirmed]);

  const handleChange = (name, value) => {
    setModalContent({ ...modal_content, [name]: value, });
  };

  // console.log(modal_content);

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

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-unset shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Username:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <input
                        type="text"
                        value={modal_content.username || ''} onChange={e => handleChange('username', e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input name ..."
                      />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold justify-start text-right" htmlFor="">Email:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <input
                        type="email"
                        value={modal_content.email || ''} onChange={e => handleChange('email', e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input name ..."
                      />
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Tables:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <MultiSelect
                        options={multiOptions}
                        value={modal_content.tables}
                        onChange={val => handleChange('tables', val)}
                        labelledBy="Select"
                      />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold justify-start text-right" htmlFor="">Password:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <input
                        type="password"
                        value={modal_content.password || ''} onChange={e => handleChange('password', e.target.value)}
                        className="p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Input password ..." autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Provider:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <select
                        value={modal_content.provider || 'local'} onChange={e => handleChange('provider', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value='local'>Local</option>
                        <option value='TBD' disabled>TBD</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Confirmed:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <select
                        value={modal_content.confirmed || CONST_FALSE} onChange={e => handleChange('confirmed', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value={CONST_TRUE}>TRUE</option>
                        <option value={CONST_FALSE}>FALSE</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Blocked:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <select
                        value={modal_content.blocked || CONST_FALSE} onChange={e => handleChange('blocked', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value={CONST_TRUE}>TRUE</option>
                        <option value={CONST_FALSE}>FALSE</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Super:</label>
                    <div className="col-span-4 text-sm text-gray-500">
                      <select
                        value={modal_content.superadmin || CONST_FALSE} onChange={e => handleChange('superadmin', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value={CONST_TRUE}>TRUE</option>
                        <option value={CONST_FALSE} disabled>FALSE</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-5 items-center gap-3">
                    <label className="col-span-1 font-bold text-right" htmlFor="">Role:</label>
                    <div className="col-span-4 text-sm text-gray-500">

                      <select
                        value={modal_content.role || ''} onChange={e => handleChange('role', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        {
                          roles && roles.data.map(role => <option key={role.id} value={role.id}>{role.name}</option>)
                        }
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={e => onModalSubmit(modal_content)}
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

export default UserModal;
