import graphene

from graphql.types import (
    CreateJobApplicationInput,
    DeleteJobApplicationResponse,
    JobApplicationResponse,
    UpdateJobApplicationInput,
)
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.job_application_service import (
    create_application,
    delete_application,
    update_application_fields,
    update_application_status,
)


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class CreateJobApplication(graphene.Mutation):
    class Arguments:
        input = CreateJobApplicationInput(required=True)

    Output = JobApplicationResponse

    @staticmethod
    def mutate(root, info, input):
        user = _require_auth(info)
        application = create_application(
            user_id=user["user_id"],
            company_name=input.company_name,
            role_title=input.role_title,
            location=input.get("location"),
            job_link=input.get("job_link"),
            salary_range=input.get("salary_range"),
            status=input.get("status") or "wishlist",
            notes=input.get("notes"),
            application_deadline=input.get("application_deadline"),
            applied_date=input.get("applied_date"),
        )
        return JobApplicationResponse(ok=True, message="Application created.", application=application)


class UpdateJobApplicationStatus(graphene.Mutation):
    class Arguments:
        application_id = graphene.Int(required=True)
        new_status = graphene.String(required=True)
        note = graphene.String()

    Output = JobApplicationResponse

    @staticmethod
    def mutate(root, info, application_id, new_status, note=None):
        user = _require_auth(info)
        application = update_application_status(
            application_id=application_id,
            user_id=user["user_id"],
            new_status=new_status,
            note=note,
        )
        return JobApplicationResponse(ok=True, message="Status updated.", application=application)


class UpdateJobApplication(graphene.Mutation):
    class Arguments:
        application_id = graphene.Int(required=True)
        input = UpdateJobApplicationInput(required=True)

    Output = JobApplicationResponse

    @staticmethod
    def mutate(root, info, application_id, input):
        user = _require_auth(info)
        application = update_application_fields(
            application_id=application_id,
            user_id=user["user_id"],
            company_name=input.get("company_name"),
            role_title=input.get("role_title"),
            location=input.get("location"),
            job_link=input.get("job_link"),
            salary_range=input.get("salary_range"),
            notes=input.get("notes"),
            application_deadline=input.get("application_deadline"),
            applied_date=input.get("applied_date"),
        )
        return JobApplicationResponse(ok=True, message="Application updated.", application=application)


class DeleteJobApplication(graphene.Mutation):
    class Arguments:
        application_id = graphene.Int(required=True)

    Output = DeleteJobApplicationResponse

    @staticmethod
    def mutate(root, info, application_id):
        user = _require_auth(info)
        delete_application(application_id=application_id, user_id=user["user_id"])
        return DeleteJobApplicationResponse(ok=True, message="Application deleted.")


class JobMutation(graphene.ObjectType):
    create_job_application = CreateJobApplication.Field()
    update_job_application_status = UpdateJobApplicationStatus.Field()
    update_job_application = UpdateJobApplication.Field()
    delete_job_application = DeleteJobApplication.Field()
