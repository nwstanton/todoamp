import { useState } from "react";
import { updateTodo } from "../../graphql/mutations";
import { UpdateTodoInput } from '../../API'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import { API } from 'aws-amplify'
import { NextRouter } from "next/router";




function TextEditor({
    id,
    name,
    description,
    router,
}:{
    id: string
    name: string
    description: any
    router: NextRouter
})
{
    const [expand, setExpand] = useState(false)
    
    async function handleEditText(event) {
        event.preventDefault()

        const form = new FormData(event.target)

        try {
            const updateInput: UpdateTodoInput = {
              id: id,
              name: form.get('title')!.toString(),
              description: form.get('content')!.toString(),
            }
      
            const request = (await API.graphql({
              authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
              query: updateTodo,
              variables: {
                input: updateInput,
              },
            })) 
      
            router.push('/')
          } catch ({ errors }) {
            console.error(...errors)
            throw new Error(errors[0].message)
          }

    }

    function grow(){
        setExpand(!expand)
    }



    const content = expand ? 
    <>
    {/* this will contain the form, a discard and submit button
    both buttons will cause the expand state to change. */}
    <form onSubmit={handleEditText}>
                  <fieldset>
                    <legend>Title</legend>
                    <input
                      defaultValue={name}
                      name="title"
                      className="border border-dashed rounded border-black"
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Content</legend>
                    <textarea 
                      defaultValue={description}
                      name="content"
                      className="border border-dashed rounded border-black"
                    />
                  </fieldset>


                  <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-slate-300">Edit Todo</button>
                  <button className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:bg-slate-300" type="button" onClick={grow}>
                    Cancel
                  </button>
                </form>
    </>
    :
    <>
    {/* this will expand the button into a form */}
    <button onClick={grow}> Edit Todo</button>
    </>

    return (
        <div className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:shadow-md">
            {content}
        </div>
    )
}

export default TextEditor