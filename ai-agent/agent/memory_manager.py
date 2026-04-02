class MemoryManager:
    def __init__(self):
        self.sessions = {}

    def get_history(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = []
        return self.sessions[user_id]