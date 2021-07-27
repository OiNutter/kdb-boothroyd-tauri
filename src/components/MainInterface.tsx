import { IStyle, Modal, Pivot, PivotItem, Stack } from '@fluentui/react'
import React, { FC, useEffect, useState } from 'react'
import KdbConnection from '../server/kdb-connection'
import uuid from "uuid"

import { container, pivots, serverModal, stackTokens } from '../style'
import EditorWindow from './EditorWindow'
import ManageServers from './ManageServers'
import TablePanel from './TablePanel'
import { MainContext } from '../contexts/main'
import Server, { SERVER_PREFIX } from '../types/server'
import { deleteItem, getItems, saveItem } from '../storage/storage'

const MainInterface:FC = () => {

  const [showServerModal, setShowServerModal] = useState(true)
  const [servers, setServers] = useState<{[key: string]: Server}>({})
  const [currentServer, setCurrentServer] = useState<string | undefined>(undefined)
  const [connections, setConnections] = useState<{[key: string]:KdbConnection}>({})
  const [results, setResults] = useState<{[key: string]: any}>({})

  useEffect(() => {
    loadServers()
  }, [])

  async function loadServers() {
    console.log("LOAD SERVERS")
    const items = await getItems(SERVER_PREFIX)
    const servers = new Map<string, Server>();
    (items as Array<Server>).forEach((s) => {
      if (s.id)
        servers.set(s.id, s)
    })
    console.log("LOADED", servers)
    setServers(Object.fromEntries(servers))
  }
  
  function toggleServerModal(display:boolean, server?:string) {
    setShowServerModal(display)
    if (server)
      setCurrentServer(server)
  }

  function handlePivotClick(item?: PivotItem) {
    setCurrentServer((item && item.props.itemKey) ? item.props.itemKey : undefined)
  }

  async function connectToServer(serverID:string) {
    const server = servers[serverID]
    const currentConnections = {...connections}

    // Check server data exists and we don't already have a connection to it
    if (server && !currentConnections[serverID]) {
      currentConnections[serverID] = await KdbConnection.connect(
        server.host,
        server.port
      )
    }

    setConnections(currentConnections)
  }

  function disconnectFromServer(sID:string) {
    const currentConnections = {...connections}
    if (currentConnections[sID]) {
      currentConnections[sID].reset()
      delete currentConnections[sID]
    }

    setConnections(currentConnections)
  }

  function saveServer(server: Server) {
    const current = {...servers}
    if (!server.id)
      server.id = uuid.v4()

    current[server.id] = server
    setServers(current)
    saveItem(SERVER_PREFIX, server)
  }

  function deleteServer(sID:string) {
    const current = {...servers}
    delete current[sID]
    setServers(current)
    deleteItem(SERVER_PREFIX, sID)
  }

  function updateResults(sID: string, data: any) {
    const current = {...results}
    current[sID] = data
    setResults(current)
  }

  return (
    <>
      <MainContext.Provider value={{
        currentServer, 
        setCurrentServer,
        connections,
        connectToServer,
        disconnectFromServer,
        servers,
        saveServer,
        deleteServer,
        results,
        updateResults
      }}>
        <Modal
          titleAriaId="Manage Servers"
          isOpen={showServerModal}
          styles={{ "main": serverModal as IStyle }}
          onDismiss={() => toggleServerModal(false,)}
          isBlocking={Object.keys(connections).length === 0}
        >
          <ManageServers closeModal={(server?:string) => toggleServerModal(false, server)}/>
        </Modal>
        <Stack horizontal={true} tokens={stackTokens} style={container}>
          <TablePanel toggleServerModal={toggleServerModal}/>
          <Stack style={{flex:"1 1 auto", alignItems:"stretch", minWidth: 0}}>
            <Pivot 
              selectedKey={currentServer || ""}
              style={{...pivots}}
              onLinkClick={handlePivotClick}>
              {Object.keys(connections).map((s) => (
                <PivotItem itemKey={s} key={s} headerText={servers[s].name}/>
              ))}
            </Pivot>
            <EditorWindow/>
          </Stack>
        </Stack>
      </MainContext.Provider>
    </>
  )
}

export default MainInterface