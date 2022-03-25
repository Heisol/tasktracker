import { useState } from "react"
import {Center, Group, TextInput, Accordion, Badge, ColorSwatch, Textarea, Select, Button} from '@mantine/core'
import {v4 as uuidv4} from 'uuid'
import { DatePicker } from '@mantine/dates';
import 'dayjs/locale/tl-ph'
import Sentry from "react-activity/dist/Sentry";
import "react-activity/dist/Sentry.css";

const TaskForm = ({formDisplay, taskTitle, setTaskTitle, taskTag, setTaskTag, taskTagColor, 
    setTaskTagColor, deadline, setDeadline, taskDetails, setTaskDetails, addTask, clearFields
   , taskLocation, setTaskLocation, theme, fetching}:any) => {
  
    const [selectedTag, setSelectedTag] = useState<number>(0)
  
    return (
      <>
          {formDisplay &&  <Center>
              <form onSubmit={(e:any)=>addTask(e)} >
              <Group position='center' direction='row'  >
                <Group position='left' mt='lg' direction='row' >
                  <TextInput required label="Task Name/Title" placeholder="e.g Attend daily scrum at 11am"
                  value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} />
                    <TextInput label="Tag" placeholder="Morning routine" value={taskTag} onChange={e=>{
                      if (e.target.value.includes(',')) {
                        let tags = e.target.value.split(',')
                        setTaskTag(tags)
                        return
                      }
                      setTaskTag([e.target.value])
                    }} 
                    title={`will default to 'Task' when left empty`}/>
                    
                        <Group position="center" spacing="xs">
                          {taskTag && taskTag.map((e:any, index: number)=>{
                            return (
                              <Badge variant='dot' color={taskTagColor[index] || 'blue'} key={uuidv4()} 
                              style={{cursor:'pointer', border: index == selectedTag ? '1px solid black' : ''}}
                              onClick={()=>setSelectedTag(index)}
                              >{e}</Badge>
                            )
                          })}
                          {theme && Object.keys(theme.colors).map((color) => (
                            <ColorSwatch key={color} color={theme.colors[color][6]} style={{cursor: 'pointer'}} onClick={()=>{
                              let tempCopy = taskTagColor
                              tempCopy[selectedTag] = color
                              setTaskTagColor(tempCopy)
                              let tempSelectedTag = selectedTag
                              setSelectedTag(-1)
                              setTimeout(()=>setSelectedTag(tempSelectedTag), 250)
                            }} />
                          ))}
                        </Group>

                  </Group>
                  
                </Group>
                <DatePicker placeholder="Optional" label="Deadline" value={deadline} onChange={e=>setDeadline(e)}/>
                <Textarea placeholder="Task details/remarks" label="Details" value={taskDetails} onChange={e=>setTaskDetails(e.target.value)} />
                <Select
                  label="Add task to"
                  placeholder="Column"
                  defaultValue={taskLocation}
                  onChange={(e:any)=>setTaskLocation(e)}
                  data={[
                    { value: '1', label: 'Backlogs' },
                    { value: '2', label: 'Work in progress' },
                    { value: '3', label: 'Done' },
                  ]}
                />
                <Group position="center" mt="md">
                  {!fetching && <>
                  <Button type="reset" color={'dark'} onClick={clearFields} >Clear fields</Button>
                  <Button type="submit" >Add task</Button>
                  </>}
                  {fetching && <Sentry/>}
                </Group>
              </form>
          </Center>}
      </>
    )
}

export default TaskForm