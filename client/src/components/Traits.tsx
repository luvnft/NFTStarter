import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';

export default function Traits({setData}:any) {
  const [traitList, setTraitList] = useState([{
    id: uuidv4(),
    traitType: "",
    value: ""
  },{
    id: uuidv4(),
    traitType: "",
    value: ""
  }]);

  const addOption = () => {
    setTraitList(traitList => [...traitList, {
      id: uuidv4(),
      traitType: "",
      value: ""
    }]);
  }

  const removeOption = (id: string) => {
    const z = traitList.filter((z) => z.id !== id);
    setTraitList(z);
  }

  const addOptionValue = (id: string, traitType: string, value: string) => {
    const updatedOptions = traitList.map((option) =>
      option.id === id ? { ...option, traitType, value } : option
    );
    setTraitList(updatedOptions);
  }

  useEffect(() => {
    setData(traitList)
  }, [traitList])

  return (
    <div className="text-base-content">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Traits describe attributes of your item. They appear as filters inside your collection page and are also listed out inside your item page.</span>
        </div>
        <div className="flex gap-3 flex-col">
          {traitList.map((trait) => (
            <div key={trait.id} className="flex gap-2">
              <input onChange={(e) => addOptionValue(trait.id, e.target.value, trait.value,)} type="text" placeholder="Type" className="flex-auto w-fit input input-bordered" />
              <input onChange={(e) => addOptionValue(trait.id, trait.traitType, e.target.value)} type="text" placeholder="Value" className="flex-auto w-fit input input-bordered" />
              <button onClick={() => removeOption(trait.id)} className="btn btn-outline btn-error w-12">x</button>
            </div>
          ))}
          <div onClick={() => addOption()} className="border border-neutral-content border-dashed w-full font-bold text-xl place-items-center px-4 py-2 h-12 rounded-full text-center cursor-pointer"> + </div>
        </div>
      </label>
    </div>
  )
}