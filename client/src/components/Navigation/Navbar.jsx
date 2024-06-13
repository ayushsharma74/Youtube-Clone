import { Aperture,SquarePlus,Bell,Search} from 'lucide-react';
export default function Navbar() {
    return (
    
        <div class="navbar bg-base-100 shadow-lg flex justify-between fixed z-10 ">
            <div class="">
                <a class="btn btn-ghost text-xl"><Aperture /></a>
            </div>
            <div className='flex gap-3 '>
            <input type="text" placeholder='Search...' className='py-3 px-6 rounded-full border-gray-400 border-solid border' />
            <Search className='cursor-pointer' />
            </div>
             <div className="flex-none">
                <div className="mr-3">
                    <div tabindex="0" role="button" className="btn btn-ghost btn-circle">
                        <div className="indicator flex items-center justify-center">
                            <SquarePlus  />
                        </div>
                    </div>
                    <div tabindex="0" role="button" className="btn btn-ghost btn-circle">
                        <div className="indicator flex items-center justify-center">
                            <Bell  />
                        </div>
                    </div>
                </div>
                <div className="dropdown dropdown-end">
                    <div tabindex="0" role="button" className="btn btn-ghost btn-circle avatar mr-3">
                        <div className="w-10 rounded-full">
                            <img alt="Tailwind CSS Navbar component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                    </div>
                    <ul tabindex="0" className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
    )
}