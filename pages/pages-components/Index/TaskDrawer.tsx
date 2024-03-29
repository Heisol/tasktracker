import { Drawer, Paper, Group, Text, Badge } from "@mantine/core"
import { v4 as uuidv4 } from "uuid"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit} from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@mantine/rte'), {
  ssr: false,
})

const TaskDrawer = ({task,drawerDisplay, setDrawerDisplay}:any) => {

  return (
    <>
    {task && <Drawer
        opened={drawerDisplay}
        onClose={() =>setDrawerDisplay(false)}
        padding="xl"
        size="40%"
        position="right"
      >
        <Paper key={uuidv4()} className='mb-2' shadow="xl" radius="xl" p="md">
            <Group position='apart' direction="row" className='mx-3' >
              <Text color={'cyan'} >{task.title}</Text>
              <FontAwesomeIcon icon={faEdit} />
            </Group>
            <Group position="left" className='py-3'>
            {task.tag.map((tag:any, index:number)=>{
                if (tag) return(<Badge color={task.tagColor[index]} variant="dot" key={uuidv4()} >
                {tag}
                </Badge>)
            })}
            </Group>
            <RichTextEditor value={task.details} onChange={()=>{}} readOnly/>
        </Paper>
    </Drawer>}
    </>
  )
}

export default TaskDrawer
