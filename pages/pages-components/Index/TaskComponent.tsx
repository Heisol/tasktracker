import {v4 as uuidv4} from 'uuid'
import {Group, Text, Badge, Accordion, Paper, Divider, Burger, Popover, Button, Select} from '@mantine/core'
import TaskDrawer from './TaskDrawer'
import { useState } from 'react'
import { db } from '../../../localmodules/firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import TaskEditForm from './TaskEditForm'

const TaskComponent = ({e, tasks, setTasks, theme, cUser}:any) =>{

  const [drawerDisplay, setDrawerDisplay] = useState<boolean>(false)
  const [popoverDisplay, setPopoverDisplay] = useState<boolean>(false)
  const [toLocation, setToLocation] = useState<string>('')
  const [displayEdit, setDisplayEdit] = useState<boolean>(false)

  const deleteThisTask = () =>{
    const confirmDelete = confirm('Would you like to delete This task')
    if (!confirmDelete) return
    if (e.docId) {
      deleteDoc(doc(db, cUser, e.docId)).catch(e=>{
        alert(`Error ${e.code}: ${e.message}`)
        return
      })
    }
    const newTasks = tasks.filter((task:any)=>task!==e)
    setTasks(newTasks)
  }

  const moveThisTask = () =>{
    if (e.docId) {
      
    }
    const newTasks = tasks.map((task:any)=>{
      if (task == e) {
        let newTask = task
        console.log(task.location)
        newTask.location = toLocation
        console.log(newTask.location)
        return newTask
      }
      return task
    })
    setTasks(newTasks)
  }
 
  return (<>
  <Paper key={uuidv4()} className='mb-2' shadow="xl" radius="xl" p="md">
      <TaskDrawer task={e} drawerDisplay={drawerDisplay} setDrawerDisplay={setDrawerDisplay}  tasks={tasks} setTasks={setTasks} />
      <TaskEditForm task={e} tasks={tasks} setTasks={setTasks} theme={theme} displayed={displayEdit} setDisplayed={setDisplayEdit} cUser={cUser} />
      <Group position='apart' className='mx-3' >
        <Text color={'cyan'} >{e.title}</Text>
        <Popover
          opened={popoverDisplay}
          onClose={() =>setPopoverDisplay(false)}
          target={<Burger
            opened={false}
            onClick={() => setPopoverDisplay(true)}
            title={'Task options and actions'}
            size='sm'
          />}
          width={400}
          position="top"
          withArrow
        >
          <Group direction='column' position='left'>
            <Button color={'red'} onClick={()=>deleteThisTask()} >Delete Task</Button>
            <Group direction='row' position='left'>
              <Button color={'cyan'} disabled={!toLocation || (e.location == toLocation)} onClick={moveThisTask} >Move To</Button>
              <Select
                    placeholder="Column"
                    defaultValue={toLocation}
                    onChange={(e:any)=>setToLocation(e)}
                    data={[
                      { value: '1', label: 'Backlogs' },
                      { value: '2', label: 'Work in progress' },
                      { value: '3', label: 'Done' },
                    ]}
              />
            </Group>
            <Button color={'grape'} onClick={()=>{
              setPopoverDisplay(false)
              setDisplayEdit(true)
            }} >Edit task</Button>
          </Group>
          {/* Add actions edit move delete */}
        </Popover>
      </Group>
      <Group position="left" className='mx-3' style={{ marginBottom: 5, marginTop: theme.spacing.sm }}>
        {e.tag.map((tag:any, index:number)=>{
          if (tag) return(<Badge color={e.tagColor[index]} variant="dot" key={uuidv4()} >
            {tag}
          </Badge>)
        })}
      </Group>
      {e.details && <Accordion iconPosition='right' >
        <Accordion.Item label='Details' >
          <Text lineClamp={8} >{e.details}</Text>
            {e.details.length > 20 &&<span className='text-info' style={{cursor:'pointer'}} onClick={()=>setDrawerDisplay(true)}>See more</span>}
        </Accordion.Item>
      </Accordion>}
  </Paper>
  <Divider my="sm" variant='dashed' />
  </>
  )
}

export default TaskComponent