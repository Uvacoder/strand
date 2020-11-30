import create, { UseStore } from "zustand";
import p from "immer";

import { createField } from './field'
import { useStore } from './store';
import { Connection } from './connection'
import { ID } from "store";

import { uuid } from "../utils"
import { ConnectorDirection } from "./connector";

export type NodeValues = {
  id: ID;
  name: string;
  fields: ID[];
};

export type Node = NodeValues & {
  addField: (id?: ID, name?: string, value?: any) => void;
  removeField: (id: ID) => void;
  pick: () => NodeValues;
  serialize: () => string;
  removeConnections: () => void
};

export type NodeStore = UseStore<Node>;

export const createNode = (id, name) =>
  create<Node>((set, get) => {
    return {
      id,
      name: name || id,
      fields: [],
      addField: (id, name, value) => {
        const fieldID = id || uuid();
        const field = createField(fieldID, name, value);

        useStore.setState(
          p((state) => {
            state.fields.set(fieldID, field);
            return state;
          })
        );

        set(
          p((node) => {
            node.fields.push(fieldID);
            return node;
          })
        );
      },
      removeField: (id) => {
        // remove related connections
        const { connections, removeConnection } = useStore.getState();

        connections.forEach((connection: Connection) => {
          // join the two ends of the connection since we only care if the field id is any of them
          const connectionString = connection.join("");
          if (connectionString.indexOf(`${id}`) > -1) {
            removeConnection(connection);
          }
        });

        useStore.setState(
          p((state) => {
            state.fields.delete(id);
            return state;
          })
        );

        set(
          p((node) => {
            const index = node.fields.indexOf(id);

            node.fields.splice(index, 1);
            return node;
          })
        );
      },
      removeConnections: () => {
        const { connections } = useStore.getState();
        const { id, fields } = get()
        
        const possibleConnections = fields.reduce((acc, field) => {
          acc.push(`${id}_${field}_${ConnectorDirection.input}`)
          acc.push(`${id}_${field}_${ConnectorDirection.output}`)
          return acc
        }, new Array())
        const newConnections = connections.filter(([connectionIn, connectionOut]) => !(possibleConnections.includes(connectionIn)||possibleConnections.includes(connectionOut)))
        
        useStore.setState(
          p((state) => {
            state.connections = newConnections
            return state;
          })
        );
      },
      pick: () => {
        const { id, name, fields } = get();
        return { id, name, fields };
      },
      serialize: () => {
        const { pick } = get();
        return JSON.stringify(pick());
      },
    };
  });
