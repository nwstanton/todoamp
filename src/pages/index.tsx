import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify, API, withSSRContext } from 'aws-amplify'
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

Amplify.configure({ ...awsExports, ssr: true })

export default function Home({ todos = [] }: { todos: Todo[] }) {
  const router = useRouter()

  async function handleCreateTodo(event: { preventDefault: () => void; target: HTMLFormElement | undefined }) {
    event.preventDefault()

    const form = new FormData(event.target)

    try {
      const createInput: CreateTodoInput = {
        name: form.get('title')!.toString(),
        description: form.get('content')!.toString(),
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
        <h3 className="text text-center text-xl">Nathan's Todo app with amplify</h3>

        <p className="text text-center">
          <code>{todos.length}</code>
          Todos
        </p>

        <div className="grid">
          {todos.map((todo) => (
            <a className="max-w-[300px] m-3 rounded border border-slate-500 hover:shadow-md" href={`/todo/${todo.id}`} key={todo.id}>
              <h3 className="p-1 rounded-t bg-slate-300">{todo.name}</h3>
              <p className="p-2 text text-center">{todo.description}</p>
            </a>
          ))}

          
            <h3 className="text text-center">Create a new Todo</h3>

            <Authenticator>
              {({ signOut }) => (
                <form onSubmit={handleCreateTodo}>
                  <fieldset>
                    <legend>Title</legend>
                    <input
                      defaultValue={`Created: ${new Date().toLocaleDateString()}`}
                      name="title"
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Content</legend>
                    <textarea 
                      defaultValue="I built an Amplify app with Next.js!"
                      name="content"
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