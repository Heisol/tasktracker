import { useEffect, useState } from "react"
import {Center, Group, TextInput, Badge, ColorSwatch, Textarea, Select, Button, Modal, Drawer} from '@mantine/core'
import {v4 as uuidv4} from 'uuid'
import { DatePicker } from '@mantine/dates';
import 'dayjs/locale/tl-ph'
import Sentry from "react-activity/dist/Sentry";
import "react-activity/dist/Sentry.css";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../localmodules/firebase";
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@mantine/rte'), {
  ssr: false,
})


const TaskEditForm = ({task, tasks, setTasks, theme ,displayed, setDisplayed, cUser}:any) => {

  const [ready, setReady] = useState<boolean>(false)

    const [localFetching, setLocalFetching] = useState<boolean>(false)
  
    const [localSelectedTag, setLocalSelectedTag] = useState<number>(0)
    const [localTitle, setLocalTitle] = useState<string|undefined>()
    const [localTag, setLocalTag] = useState<Array<string>|undefined>()
    const [localTagColor, setLocalTagColor] = useState<Array<string>|undefined>()
    const [localDeadline, setLocalDeadline] = useState<Date| null|undefined>()
    const [localDetails, setLocalDetails] = useState<string>('')
    const [localLocation, setLocalLocation] = useState<string|undefined>()

    useEffect(()=>{
      setLocalTitle(task.title)
      setLocalTag(task.tag)
      setLocalTagColor(task.tagColor)
      setLocalDeadline(task.deadline)
      setLocalDetails(task.details)
      setLocalLocation(task.location)
      setReady(true)
    }, [task])

  
    const saveTask = () =>{
      setLocalFetching(true)
      let newModTask:any = ''
      let newTask = {
        title: localTitle,
        deadline: localDeadline,
        tag: localTag,
        tagColor: localTagColor || 'blue',
        details: localDetails,
        location: localLocation || '1'
      }
      let newTasks = tasks.map((e:any)=>{
        if (e.docId == task.docId) {
          let modifiedTask = e
          modifiedTask.title= newTask.title,
          modifiedTask.deadline= newTask.deadline,
          modifiedTask.tag= newTask.tag,
          modifiedTask.tagColor= newTask.tagColor,
          modifiedTask.details= newTask.details,
          modifiedTask.location= newTask.location
          newModTask = modifiedTask
          return modifiedTask
        }
        return e
      })
      updateDoc(doc(db, cUser, task.docId), newTask).then((res)=>{
        setTasks(newTasks)
        setDisplayed(false)
      }).catch(e=>alert(`Error ${e.code}: ${e.message}`))
      .finally(()=>setLocalFetching(false))
    }

    return (
      <>
          {ready && <>
          <Modal opened={displayed} onClose={()=>setDisplayed(false)} size='xl' overlayOpacity={0.9}  >
          <Center>
              <form onSubmit={(e)=>{
                saveTask()
                e.preventDefault()
              }} >
              <Group position='center' direction='row'  >
                <Group position='left' mt='lg' direction='row' >
                  <TextInput required label="Task Name/Title" placeholder="e.g Attend daily scrum at 11am"
                  value={localTitle} onChange={e=>setLocalTitle(e.target.value)} />
                    <TextInput label="Tag" placeholder="Morning routine" value={localTag} onChange={e=>{
                      if (e.target.value.includes(',')) {
                        let tags = e.target.value.split(',')
                        setLocalTag(tags)
                        return
                      }
                      setLocalTag([e.target.value])
                    }} />
                    
                        <Group position="center" spacing="xs">
                          {localTag && localTag.map((e:any, index: number)=>{
                            return (
                              //@ts-ignore
                              <Badge variant='dot' color={localTagColor[index] || 'blue'} key={uuidv4()} 
                              style={{cursor:'pointer', border: index == localSelectedTag ? '1px solid black' : ''}}
                              onClick={()=>setLocalSelectedTag(index)}
                              >{e}</Badge>
                            )
                          })}
                          {(theme && ready) && Object.keys(theme.colors).map((color) => (
                            <ColorSwatch key={color} color={theme.colors[color][6]} style={{cursor: 'pointer'}} onClick={()=>{
                              let tempCopy = localTagColor
                              //@ts-ignore
                              tempCopy[localSelectedTag] = color
                              setLocalTagColor(tempCopy)
                              let tempSelectedTag = localSelectedTag
                              setLocalSelectedTag(-1)
                              setTimeout(()=>setLocalSelectedTag(tempSelectedTag), 250)
                            }} />
                          ))}
                        </Group>

                  </Group>
                  
                </Group>
                <DatePicker placeholder="Optional" label="Deadline" value={localDeadline} onChange={e=>setLocalDeadline(e)}/>
                {/* <Textarea placeholder="Task details/remarks" label="Details" value={localDetails} onChange={e=>setLocalDetails(e.target.value)} /> */}
                {/* <RichTextEditor value={localDetails} onChange={e=>setLocalDetails(e)} controls={[
                  ['bold', 'italic', 'underline', 'link', 'strike', 'blockquote', 'code', 'codeBlock','clean'],
                  ['unorderedList'],
                  ['sup', 'sub'],
                  ['alignLeft', 'alignCenter', 'alignRight'],
                ]}  /> */}
                <RichTextEditor value={localDetails} onChange={e=>setLocalDetails(e)}/>
                <Select
                  label="Add task to"
                  placeholder="Column"
                  defaultValue={localLocation}
                  onChange={(e:any)=>setLocalLocation(e)}
                  data={[
                    { value: '1', label: 'Backlogs' },
                    { value: '2', label: 'Work in progress' },
                    { value: '3', label: 'Done' },
                  ]}
                />
                <Group position="center" mt="md">
                  {!localFetching && <>
                  <Button onClick={saveTask} >Save task</Button>
                  </>}
                  {localFetching && <Sentry/>}
                </Group>
              </form>
          </Center>
          </Modal>
          </>}
      </>
    )
}

export default TaskEditForm