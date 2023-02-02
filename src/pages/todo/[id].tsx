import { Amplify, API, withSSRContext } from 'aws-amplify'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DeleteTodoInput, GetTodoQuery, Todo, ListTodosQuery, UpdateTodoInput } from '../../API'
import awsExports from '../../aws-exports'
import { deleteTodo, updateTodo } from '../../graphql/mutations'
import { getTodo, listTodos } from '../../graphql/queries'
import { GetStaticProps, GetStaticPaths } from 'next'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import TextEditor from './TextEditor'

Amplify.configure({ ...awsExports, ssr: true })

export default function TodoPage({ todo }: { todo: Todo }) {
  const router = useRouter()
  var chkMark = todo.completed ? <CheckCircleIcon className=" w-6 h-6 inline-block" /> : <XCircleIcon className=" w-6 h-6 inline-block" />

  if (router.isFallback) {
    return (
      <div className="container">
        <h1>Loading&hellip;</h1>
      </div>
    )
  }

  async function handleComplete(): Promise<void>{
    try{
      const updateInput: UpdateTodoInput = {
        id: todo.id,
        completed: !todo.completed
      }

      await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: updateTodo,
        variables: {
          input: updateInput,
        },

      })
      //this feels like a hack, brain says useState() rather than router push
      router.push(window.location.pathname)  
    }
    catch ({ errors }) {
      console.error(...errors)
      throw new Error(errors[0].message)
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      const deleteInput: DeleteTodoInput = {
        id: todo.id,
      }

      await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: deleteTodo,
        variables: {
          input: deleteInput,
        },
      })

      router.push(`/`)
    } catch ({ errors }) {
      console.error(...errors)
      throw new Error(errors[0].message)
    }

  }

  return (
    <div className="flex flex-col items-center pt-5">
      <Head>
        <title>{todo.name}  Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative max-w-[300px] m-3 rounded border border-slate-500 hover:shadow-md">
        <div>
          <h1 className={"p-1 text text-xl rounded-t " + (todo.completed ? 'bg-green-300' : 'bg-red-300')}>{todo.name}</h1>
          <p className="p-2 text text-center">{todo.description}</p>
        </div>
        <div className=" pl-[25%]">Completed: {chkMark}</div>
      </main>
        <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-green-300 hover:shadow-md" onClick={handleComplete}>
          <p>Mark {todo.completed ? " Incomplete" : " Complete"}</p>
        </button>
        <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-red-300 hover:shadow-md" onClick={handleDelete}>
          <p> Delete todo</p>
        </button>
        <TextEditor id={todo.id} name={todo.name} description={todo.description} router={router}></TextEditor>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext()

  const todosQuery = (await SSR.API.graphql({
    query: listTodos,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })) as { data: ListTodosQuery; errors: any[] }

  const paths = todosQuery.data.listTodos.items.map((todo: Todo) => ({
    params: { id: todo.id },
  }))

  return {
    fallback: true,
    paths,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const SSR = withSSRContext()

  const response = (await SSR.API.graphql({
    query: getTodo,
    variables: {
      id: params.id,
    },
  })) as { data: GetTodoQuery }

  return {
    props: {
      todo: response.data.getTodo,
    },
  }
}