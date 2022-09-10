import type { NextPage } from 'next'
import Head from 'next/head';
import Image from 'next/image';
import googleLogo from '../public/googlelogo.svg'
import styles from '../styles/main.module.css'
import { AppShell, Navbar, Header, Center, Grid, Card, Group ,Text,
  useMantineTheme, Modal, Button, Skeleton
 } from '@mantine/core';
import { useState, useEffect } from 'react';
import TaskForm from './pages-components/Index/TaskForm';
import TaskComponent from './pages-components/Index/TaskComponent';
import {app, db} from '../localmodules/firebase'
import { addDoc, collection, documentId, getDocs } from 'firebase/firestore'
import { GoogleAuthProvider, getAuth, signInWithPopup, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus} from '@fortawesome/free-solid-svg-icons'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Task Tracker</title>
      </Head>
      <Main/>
    </>
  )
}

export default Home

const Main = () => {
  const [fetching, setFetching] = useState<boolean>(false)
  const [googleFetching, setGoogleFetching] = useState<boolean>(false)
  const [userDetails, setUserDetails] = useState<{
    displayName: string | null,
    email: string | null,
    photoUrl: string,
    uid: string | null} | null | undefined>()
  const [cUser, setCUser] = useState<string>()
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);
  const signIn = () =>{
    setPersistence(auth, browserLocalPersistence)
    setFetching(true)
    signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      setUserDetails({email: user.email, displayName: user.displayName, photoUrl: user.photoURL || '', uid: user.uid})
      setCUser(result.user.uid)
      loadTasks(user.uid)
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert(`Error ${errorCode}: ${errorMessage}`)
      setFetching(false)
    })
  }
  const clickSignOut = () =>{
    signOut(auth).then(()=>{
      setUserDetails(undefined)
      setCUser(undefined)
      setTasks(null)
    }).catch(e=>alert(`Error ${e.code}: ${e.message}`))
  }
  const loadTasks = (uid:string) =>{
    setGoogleFetching(true)
    getDocs(collection(db, uid))
    .then((res:any)=>{
      let tempArr = res.docs.map((e:any)=>{
        let docId = e.id
        let data =  e.data()
        data.docId = docId
        return data
      })
      tempArr = tempArr.map((e:any, index: number)=>{
        e.dateCreated = e.dateCreated.toDate()
        e.deadline = e.deadline.toDate()
        return e
      })
      setTasks(tempArr)
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert(`Error ${errorCode}: ${errorMessage}`)
      }).finally(()=>{
        setFetching(false)
        setGoogleFetching(false)
      })
    }

    useEffect(()=>{
      if (auth.currentUser) {
        let user = auth.currentUser
        setUserDetails({email: user.email, displayName: user.displayName, photoUrl: user.photoURL || '', uid: user.uid})  
        setCUser(user.uid)
        loadTasks(user.uid)
        return
      }
      setCUser(undefined)
    }, [auth])
    
  // firebaseFuncs

  interface types {
    task : {
      title: string,
      dateCreated: Date,
      deadline: string | undefined | null| Date,
      tag: Array<string>,
      tagColor: Array<string>,
      details: string | undefined | null,
      location: string,
      docId: string | undefined | null
    },
    taskArr : Array<types['task']> | null
  }
  const theme = useMantineTheme();
  
  const [tasks, setTasks] = useState<types['taskArr']>(null)
  // task form
  const [taskTitle, setTaskTitle] = useState<string>('')
  const [taskTag, setTaskTag] = useState<Array<string>>([''])
  const [taskTagColor, setTaskTagColor] = useState<Array<string>>([''])
  const [deadline, setDeadline] = useState<Date>(new Date())
  const [taskDetails, setTaskDetails] = useState<string>('')
  const [taskLocation, setTaskLocation] = useState<string>('1')
  const [formDisplay, setFormDisplay] = useState<boolean>(false)

  const addTask = (e:any) =>{
    let task = {
      title: taskTitle,
      dateCreated: new Date(),
      deadline: deadline,
      tag: taskTag,
      tagColor: taskTagColor || 'blue',
      details: taskDetails,
      location: taskLocation || '1',
      docId: ''
    }
    if (!cUser) return
    setFetching(true)
    addDoc(collection(db, cUser), task)
    .then(()=>{
      setTasks(tasks ? [...tasks, task] : [task])
      clearFields()
      setFormDisplay(false)
    }).catch(e=>{
      const errorCode = e.code
      const errorMessage = e.message
      const email = e.email;
      alert(`Error ${errorCode}: ${errorMessage}`)
    }).finally(()=>setFetching(false))
    // clear after success when logged in
    e.preventDefault()
  }

  const clearFields = () =>{
    let now = new Date()
    let sevenDaysFromNow = new Date(now.getTime() + 604800000)
    setTaskTitle('')
    setTaskTag([''])
    setTaskTagColor(['blue'])
    setDeadline(sevenDaysFromNow)
    setTaskDetails('')
    setTaskLocation('1')
  }


  return (
    <AppShell
      padding="lg"
      header={<Header height={100} p="lg" className='bg-dark text-light' >
        Task Tracker
      </Header>}
      navbar={<Navbar width={{ base: 200 }} height={''} p="lg">{
        <>
          <Navbar.Section mt='lg' className='align-items-center d-flex flex-row justify-content-center' id={`${styles['googleSignIn']}`}>
            {(!cUser) && 
              <Button variant='outline' onClick={signIn} disabled={fetching} >
                <Group direction='row'>Sign in<Image src={googleLogo} layout={'fixed'} alt='Google Logo'></Image></Group>
              </Button>
            }
            {(cUser&&userDetails) && 
              <Group onClick={clickSignOut} className='btn-dark btn d-flex flex-row' direction='row' position='center'>Sign Out <Image className={styles.googlePhoto} height={30} width={30} src={userDetails.photoUrl} alt="User image" /> </Group>
            }
          </Navbar.Section>
          {!formDisplay && <Navbar.Section grow mt='lg' className='justify-content-center d-flex flex-row'>
            <Navbar.Section mt='lg' >
              <Button disabled={!cUser || fetching} style={{width: '100px'}} className={`btn btn-primary ${styles['opacityChange']}`} onClick={()=>setFormDisplay(!formDisplay)} >{fetching ? '' : 'Add task'}</Button>
            </Navbar.Section>
          </Navbar.Section>}
        </>
      }</Navbar>}
      
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[4] },
      })}
    >
      <Center>
        {cUser && <Group position='center' direction='row' >
          <Group>
            <Modal opened={formDisplay} onClose={()=>setFormDisplay(false)} size='xl' overlayOpacity={0.9} >
              <TaskForm formDisplay={formDisplay} taskTitle={taskTitle} setTaskTitle={ setTaskTitle} taskTag={taskTag} setTaskTag={setTaskTag} taskTagColor={taskTagColor} 
                setTaskTagColor={setTaskTagColor} deadline={deadline} setDeadline={setDeadline} taskDetails={taskDetails} setTaskDetails={setTaskDetails} 
                addTask={addTask} clearFields={clearFields} taskLocation={taskLocation} setTaskLocation={setTaskLocation} 
                theme={theme} fetching={fetching} />
            </Modal>
          </Group>
          
          <Grid style={{width:'80vw', textAlign: 'center'}} gutter='lg' columns={18} justify='center' >
            <Grid.Col span={5} className=' m-3' style={{borderRadius: 10}} >
              {!googleFetching&&<>
              <Card className='mb-3 bg-transparent'>
                <Card.Section>
                  <Group direction='row' position='center' >
                    <Text color={'blue'} weight={500} >Backlogs</Text>
                    <FontAwesomeIcon icon={faCirclePlus} color={!fetching ? 'blue' : 'gray'} onClick={()=>{
                      if (fetching) return
                      setFormDisplay(!formDisplay)
                      setTaskLocation('1')
                    }} style={{cursor: 'pointer'}}/>
                  </Group>
                </Card.Section>
              </Card>
              {tasks && tasks.map(e=>{if (e.location =='1') return <TaskComponent e={e} theme={theme} tasks={tasks} setTasks={setTasks} 
              cUser={cUser}/>})}
              </>}
              {googleFetching &&
              <>
              <Group direction='row' position='apart' className='m-3' >
                <Skeleton height={25} width={200} radius='xl' visible={true}/>
                <Skeleton height={25} circle className='' visible={true}/>
              </Group>
              <Skeleton height={200} radius='xl' className='m-3' visible={true}/>
              </>
              }
            </Grid.Col>
            <Grid.Col span={5} className='m-3' style={{borderRadius: 10}} >
              {!googleFetching &&<>
              <Card className='mb-3 bg-transparent'>
                <Card.Section >
                  <Group direction='row' position='center' >
                    <Text color={'green'} weight={500} >Work In Progress</Text>
                    <FontAwesomeIcon icon={faCirclePlus} color={!fetching ? 'green' : 'gray'} onClick={()=>{
                      if (fetching) return
                      setFormDisplay(!formDisplay)
                      setTaskLocation('2')
                    }} style={{cursor: 'pointer'}} />
                  </Group>
                </Card.Section>
              </Card>
              {tasks && tasks.map(e=>{if (e.location =='2') return <TaskComponent e={e} theme={theme} tasks={tasks} setTasks={setTasks}
              cUser={cUser} />})}
              </>}
              {googleFetching &&
              <>
              <Group direction='row' position='apart' className='m-3' >
                <Skeleton height={25} width={200} radius='xl' visible={true}/>
                <Skeleton height={25} circle className='' visible={true}/>
              </Group>
              <Skeleton height={200} radius='xl' className='m-3' visible={true}/>
              </>
              }
            </Grid.Col>
            <Grid.Col span={5} className='m-3' style={{borderRadius: 10}} >
              {!googleFetching&&<>
              <Card className='mb-3 bg-transparent'>
                <Card.Section>
                  <Group direction='row' position='center' >
                    <Text color={'grap'} weight={500} >Done</Text>
                    <FontAwesomeIcon icon={faCirclePlus} color={!fetching ? 'purple' : 'gray'} onClick={()=>{
                      if (fetching) return
                      setFormDisplay(!formDisplay)
                      setTaskLocation('3')
                    }} style={{cursor: 'pointer'}}/>
                  </Group>
                </Card.Section>
              </Card>
              {tasks && tasks.map(e=>{if (e.location =='3') return <TaskComponent e={e} theme={theme} tasks={tasks} setTasks={setTasks}
              cUser={cUser} />})}
              </>}
              {googleFetching &&
              <>
              <Group direction='row' position='apart' className='m-3' >
                <Skeleton height={25} width={200} radius='xl' visible={true}/>
                <Skeleton height={25} circle className='' visible={true}/>
              </Group>
              <Skeleton height={200} radius='xl' className='m-3' visible={true}/>
              </>
              }
            </Grid.Col>
          </Grid>
          </Group>}   
        
      </Center>
    </AppShell>
  )
}




