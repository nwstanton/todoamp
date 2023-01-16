import { Amplify, API, withSSRContext } from 'aws-amplify'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DeleteTodoInput, GetTodoQuery, Todo, ListTodosQuery } from '../../API'
import awsExports from '../../aws-exports'
import { deleteTodo } from '../../graphql/mutations'
import { getTodo, listTodos } from '../../graphql/queries'
import { GetStaticProps, GetStaticPaths } from 'next'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'

Amplify.configure({ ...awsExports, ssr: true })

export default function TodoPage({ todo }: { todo: Todo }) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <div className="container">
        <h1>Loading&hellip;</h1>
      </div>
    )
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

      <main className="max-w-[300px] m-3 rounded border border-slate-500 hover: shadow-md">
        <h1 className="p-1 text text-xl rounded-t bg-slate-300">{todo.name}</h1>
        <p className="p-2 text text-center">{todo.description}</p>
      </main>

      <footer>
        <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-slate-300" onClick={handleDelete}>
          <p> Delete todo</p>
        </button>
      </footer>
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