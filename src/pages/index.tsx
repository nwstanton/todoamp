import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify, API, Auth, withSSRContext } from 'aws-amplify'
import Head from 'next/head'
import awsExports from '../aws-exports'
import { createTodo } from '../graphql/mutations'
import { listTodos } from '../graphql/queries'
import {
  CreateTodoInput,
  CreateTodoMutation,
  ListTodosQuery,
  Todo,
} from '../API'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { GetServerSideProps } from 'next'
import {CursorArrowRaysIcon} from '@heroicons/react/24/solid'
import '@aws-amplify/ui-react/styles.css';


Amplify.configure({ ...awsExports, ssr: true })


export default function Home({ todos = [] }: { todos: Todo[] }) {
  const router = useRouter()
  
  let todoCount: string = todos.length.toString() + " " + (todos.length > 1 ? "Todos" : "Todo")

  async function handleCreateTodo(event: { preventDefault: () => void; target: HTMLFormElement | undefined }) {
    event.preventDefault()

    const form = new FormData(event.target)

    try {
      const createInput: CreateTodoInput = {
        name: form.get('title')!.toString(),
        description: form.get('content')!.toString(),
        completed: false,
      }

      const request = (await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: createTodo,
        variables: {
          input: createInput,
        },
      })) as { data: CreateTodoMutation; errors: any[] }

      router.push(`/todo/${request.data.createTodo!.id}`)
    } catch ({ errors }) {
      console.error(...errors)
      throw new Error(errors[0].message)
    }
  }

  return (
    <div className="flex flex-col items-center pt-5">
      <Head>
        <title>Nathan's Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main >
        <div className="border rounded bg-gradient-to-r from-green-300 to-blue-400">
          <h1>Nathan's Todo app with amplify </h1>
          <p>
            {todoCount}
          </p>
        </div>
        <div className="grid">
          {todos.map((todo) => (
            <a className="max-w-[500px] m-3 rounded border border-slate-500 hover:shadow-md relative" href={`/todo/${todo.id}`} key={todo.id}>
              <CursorArrowRaysIcon className="w-4 h-4 absolute right-1 top-1" />
              <h2 className="p-1 rounded-t bg-slate-300">{todo.name}</h2>
              <p>{todo.description}</p>
            </a>
          ))}

          
            <h1 className="p-2">Create a new Todo</h1>
            
            <Authenticator>
              {({ signOut }) => (
                <form onSubmit={handleCreateTodo}>
                  <fieldset>
                    <legend>Title</legend>
                    <input
                      defaultValue={`Created: ${new Date().toLocaleDateString()}`}
                      name="title"
                      className="border border-dashed rounded border-black"
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Content</legend>
                    <textarea 
                      defaultValue="I built an Amplify app with Next.js!"
                      name="content"
                      className="border border-dashed rounded border-black"
                    />
                  </fieldset>


                  <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-slate-300">Create Todo</button>
                  <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-slate-300" type="button" onClick={signOut}>
                    Sign out
                  </button>
                </form>
              )}
            </Authenticator>
          </div>
        
      </main>
      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req })

  const response = (await SSR.API.graphql({ query: listTodos })) as {
    data: ListTodosQuery
  }

  return {
    props: {
      todos: response.data.listTodos!.items,
    },
  }
}