import CreateEventForm from '@/components/CreateEventForm'
import PageHeader from '@/components/ui/PageHeader'

const CreateEventPage = () => {
  return (
    <div>
      <PageHeader title="Create New Event" subtitle="Fill in the details to publish your event" />
      <CreateEventForm />
    </div>
  )
}

export default CreateEventPage
