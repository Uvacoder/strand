import React, { useCallback, useEffect, useRef } from "react";
import { PrimitiveAtom, useAtom } from 'jotai'

import Connector from './Connector'

import { ConnectorDirection, NodeField as FieldType } from '../atoms'
import produce from "immer";

type FieldProps = {
  fieldAtom: PrimitiveAtom<FieldType>,
  nodeId: string,
  onDelete: (deleteId) => void
}

function Field({ fieldAtom, nodeId, onDelete }: FieldProps) {

  const [{ id, name }, setField] = useAtom(fieldAtom)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef!.current!.focus()
  }, [])

  const handleChange = useCallback((e)=>{
    const value = e.target.value
    setField(produce(field => {
      field.name = value
    }))
  }, [setField])
  
  return (
    <div key={id} className="flex space-x-2 items-center">
      <Connector node={nodeId} field={id} direction={ConnectorDirection.input} />
      <div className="flex-1">

        <div className="relative group flex items-center">
          <input ref={inputRef} className="flex-1 p-1 px-2 bg-transparent" value={name} onChange={handleChange} />
          <button className="font-bold text-red-600 text-xs absolute right-0 mr-3 opacity-0 group-hover:opacity-100" onClick={() => onDelete(id)}>
            Delete
          </button>
        </div>
        
      </div>
      <Connector node={nodeId} field={id} direction={ConnectorDirection.output} />
    </div>
  )
}

export default Field
