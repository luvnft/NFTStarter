import { useEffect } from "react"

export default function SimpleLoading({state, description}:{state:number, description:string}) {
  const modal = document.getElementById('loading_modal')

  useEffect(() => {
    const run = async () =>{
      if(state > 0) {
        // eslint-disable-next-line
        // @ts-ignore
        modal.showModal()
      }else{
        // eslint-disable-next-line
        // @ts-ignore
        modal?.close()
      }
    }
    run()
  }, [state])

  return(
    <dialog id="loading_modal" className="modal">
      <div className="modal-box flex flex-col items-center gap-2">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg">{description}</h3>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </dialog>
  )
}