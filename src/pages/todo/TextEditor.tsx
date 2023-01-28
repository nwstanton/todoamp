import { useState } from "react";

function TextEditor({

    name,
    description,
}:{
    name: string
    description: any
})
{
    const [expand, setExpand] = useState(false)

    function grow(){
        setExpand(!expand)
    }

    const content = expand ? 
    <>
    {/* this will contain the form, a discard and submit button
    both buttons will cause the expand state to change. */}
    <p> i am not expanded</p>
    </>
    :
    <>
    {/* this will expand the button into a form */}
    <button onClick={grow}> here is some shit</button>
    </>

    return (
        <div className=" m-4 p-2 shadow-sm rounded border border-slate-500 hover:shadow-md">
            {content}
        </div>
    )
}

export default TextEditor