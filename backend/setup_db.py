# setup_db.py
from app import app, db, Housing, Counseling, Organizations, State


def setup_database():
    with app.app_context():
        print("Setting up database...")
        db.create_all()

        # collect all missing state names
        all_states = set()
        for model in [Housing, Counseling, Organizations]:
            instances = model.query.all()
            for instance in instances:
                state_name = instance.state.strip() if instance.state else "Unknown"
                all_states.add(state_name)

        # create missing states
        created_states = []
        for state_name in all_states:
            existing_state = State.query.filter_by(name=state_name).first()
            if not existing_state:
                new_state = State(name=state_name)
                db.session.add(new_state)
                created_states.append(state_name)
        db.session.commit()

        if created_states:
            print(f"Added new states: {created_states}")
        else:
            print("ℹNo new states added (already up to date).")

        # create links between models
        linked_count = 0
        for model in [Housing, Counseling, Organizations]:
            instances = model.query.all()
            for instance in instances:
                state_name = instance.state.strip() if instance.state else "Unknown"
                state_obj = State.query.filter_by(name=state_name).first()
                if state_obj and state_obj not in instance.states:
                    instance.states.append(state_obj)
                    db.session.add(instance)
                    linked_count += 1

        db.session.commit()
        print(f"Linked {linked_count} records to their state(s).")
        print("Database setup complete!")


if __name__ == "__main__":
    setup_database()
