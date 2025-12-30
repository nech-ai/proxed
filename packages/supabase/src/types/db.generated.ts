export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			device_checks: {
				Row: {
					apple_team_id: string;
					created_at: string;
					id: string;
					key_id: string;
					name: string;
					private_key_p8: string;
					team_id: string;
					updated_at: string;
				};
				Insert: {
					apple_team_id: string;
					created_at?: string;
					id?: string;
					key_id: string;
					name?: string;
					private_key_p8: string;
					team_id: string;
					updated_at?: string;
				};
				Update: {
					apple_team_id?: string;
					created_at?: string;
					id?: string;
					key_id?: string;
					name?: string;
					private_key_p8?: string;
					team_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "device_checks_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			executions: {
				Row: {
					city: string | null;
					completion_cost: number;
					completion_tokens: number;
					country_code: string | null;
					created_at: string;
					device_check_id: string | null;
					error_code: string | null;
					error_message: string | null;
					finish_reason: Database["public"]["Enums"]["finish_reason"];
					id: string;
					ip: string;
					key_id: string | null;
					latency: number;
					latitude: number | null;
					longitude: number | null;
					model: string;
					project_id: string;
					prompt: string | null;
					prompt_cost: number;
					prompt_tokens: number;
					provider: Database["public"]["Enums"]["provider_type"];
					region_code: string | null;
					response: string | null;
					response_code: number;
					team_id: string;
					total_cost: number;
					total_tokens: number;
					updated_at: string;
					user_agent: string | null;
				};
				Insert: {
					city?: string | null;
					completion_cost?: number;
					completion_tokens: number;
					country_code?: string | null;
					created_at?: string;
					device_check_id?: string | null;
					error_code?: string | null;
					error_message?: string | null;
					finish_reason: Database["public"]["Enums"]["finish_reason"];
					id?: string;
					ip: string;
					key_id?: string | null;
					latency: number;
					latitude?: number | null;
					longitude?: number | null;
					model: string;
					project_id: string;
					prompt?: string | null;
					prompt_cost?: number;
					prompt_tokens: number;
					provider: Database["public"]["Enums"]["provider_type"];
					region_code?: string | null;
					response?: string | null;
					response_code: number;
					team_id: string;
					total_cost?: number;
					total_tokens: number;
					updated_at?: string;
					user_agent?: string | null;
				};
				Update: {
					city?: string | null;
					completion_cost?: number;
					completion_tokens?: number;
					country_code?: string | null;
					created_at?: string;
					device_check_id?: string | null;
					error_code?: string | null;
					error_message?: string | null;
					finish_reason?: Database["public"]["Enums"]["finish_reason"];
					id?: string;
					ip?: string;
					key_id?: string | null;
					latency?: number;
					latitude?: number | null;
					longitude?: number | null;
					model?: string;
					project_id?: string;
					prompt?: string | null;
					prompt_cost?: number;
					prompt_tokens?: number;
					provider?: Database["public"]["Enums"]["provider_type"];
					region_code?: string | null;
					response?: string | null;
					response_code?: number;
					team_id?: string;
					total_cost?: number;
					total_tokens?: number;
					updated_at?: string;
					user_agent?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "executions_device_check_id_fkey";
						columns: ["device_check_id"];
						isOneToOne: false;
						referencedRelation: "device_checks";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "executions_key_id_fkey";
						columns: ["key_id"];
						isOneToOne: false;
						referencedRelation: "provider_keys";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "executions_project_id_fkey";
						columns: ["project_id"];
						isOneToOne: false;
						referencedRelation: "projects";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "executions_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			vault_objects: {
				Row: {
					bucket: string;
					created_at: string;
					execution_id: string | null;
					id: string;
					mime_type: string;
					path_tokens: string[];
					project_id: string;
					size_bytes: number | null;
					team_id: string;
					updated_at: string;
				};
				Insert: {
					bucket: string;
					created_at?: string;
					execution_id?: string | null;
					id?: string;
					mime_type: string;
					path_tokens: string[];
					project_id: string;
					size_bytes?: number | null;
					team_id: string;
					updated_at?: string;
				};
				Update: {
					bucket?: string;
					created_at?: string;
					execution_id?: string | null;
					id?: string;
					mime_type?: string;
					path_tokens?: string[];
					project_id?: string;
					size_bytes?: number | null;
					team_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "vault_objects_execution_id_fkey";
						columns: ["execution_id"];
						isOneToOne: false;
						referencedRelation: "executions";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "vault_objects_project_id_fkey";
						columns: ["project_id"];
						isOneToOne: false;
						referencedRelation: "projects";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "vault_objects_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			projects: {
				Row: {
					bundle_id: string;
					created_at: string;
					default_user_prompt: string | null;
					description: string;
					device_check_id: string | null;
					icon_url: string | null;
					id: string;
					is_active: boolean;
					key_id: string | null;
					last_rate_limit_notified_at: string | null;
					model: string | null;
					name: string;
					notification_interval_seconds: number | null;
					notification_threshold: number | null;
					save_images_to_vault: boolean;
					schema_config: Json | null;
					system_prompt: string | null;
					team_id: string;
					test_key: string | null;
					test_mode: boolean | null;
					updated_at: string;
				};
				Insert: {
					bundle_id: string;
					created_at?: string;
					default_user_prompt?: string | null;
					description: string;
					device_check_id?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					key_id?: string | null;
					last_rate_limit_notified_at?: string | null;
					model?: string | null;
					name: string;
					notification_interval_seconds?: number | null;
					notification_threshold?: number | null;
					save_images_to_vault?: boolean;
					schema_config?: Json | null;
					system_prompt?: string | null;
					team_id: string;
					test_key?: string | null;
					test_mode?: boolean | null;
					updated_at?: string;
				};
				Update: {
					bundle_id?: string;
					created_at?: string;
					default_user_prompt?: string | null;
					description?: string;
					device_check_id?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					key_id?: string | null;
					last_rate_limit_notified_at?: string | null;
					model?: string | null;
					name?: string;
					notification_interval_seconds?: number | null;
					notification_threshold?: number | null;
					save_images_to_vault?: boolean;
					schema_config?: Json | null;
					system_prompt?: string | null;
					team_id?: string;
					test_key?: string | null;
					test_mode?: boolean | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "projects_device_check_id_fkey";
						columns: ["device_check_id"];
						isOneToOne: false;
						referencedRelation: "device_checks";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "projects_key_id_fkey";
						columns: ["key_id"];
						isOneToOne: false;
						referencedRelation: "provider_keys";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "projects_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			provider_keys: {
				Row: {
					created_at: string;
					display_name: string;
					id: string;
					is_active: boolean;
					provider: Database["public"]["Enums"]["provider_type"];
					team_id: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					display_name: string;
					id?: string;
					is_active?: boolean;
					provider: Database["public"]["Enums"]["provider_type"];
					team_id: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					display_name?: string;
					id?: string;
					is_active?: boolean;
					provider?: Database["public"]["Enums"]["provider_type"];
					team_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "provider_keys_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			team_invitations: {
				Row: {
					created_at: string;
					email: string;
					expires_at: string;
					id: string;
					invited_by_id: string | null;
					role: Database["public"]["Enums"]["team_role"];
					team_id: string;
				};
				Insert: {
					created_at?: string;
					email: string;
					expires_at?: string;
					id?: string;
					invited_by_id?: string | null;
					role?: Database["public"]["Enums"]["team_role"];
					team_id: string;
				};
				Update: {
					created_at?: string;
					email?: string;
					expires_at?: string;
					id?: string;
					invited_by_id?: string | null;
					role?: Database["public"]["Enums"]["team_role"];
					team_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "team_invitations_invited_by_id_fkey";
						columns: ["invited_by_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "team_invitations_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			team_memberships: {
				Row: {
					created_at: string;
					id: string;
					is_creator: boolean;
					role: Database["public"]["Enums"]["team_role"];
					team_id: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					is_creator?: boolean;
					role?: Database["public"]["Enums"]["team_role"];
					team_id: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					is_creator?: boolean;
					role?: Database["public"]["Enums"]["team_role"];
					team_id?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "team_memberships_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "team_memberships_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			teams: {
				Row: {
					avatar_url: string | null;
					canceled_at: string | null;
					created_at: string;
					email: string | null;
					id: string;
					name: string;
					plan: string | null;
					updated_at: string;
				};
				Insert: {
					avatar_url?: string | null;
					canceled_at?: string | null;
					created_at?: string;
					email?: string | null;
					id?: string;
					name: string;
					plan?: string | null;
					updated_at?: string;
				};
				Update: {
					avatar_url?: string | null;
					canceled_at?: string | null;
					created_at?: string;
					email?: string | null;
					id?: string;
					name?: string;
					plan?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			users: {
				Row: {
					avatar_url: string | null;
					created_at: string | null;
					email: string;
					full_name: string | null;
					id: string;
					is_admin: boolean | null;
					onboarded: boolean | null;
					team_id: string | null;
					updated_at: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					created_at?: string | null;
					email: string;
					full_name?: string | null;
					id: string;
					is_admin?: boolean | null;
					onboarded?: boolean | null;
					team_id?: string | null;
					updated_at?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					created_at?: string | null;
					email?: string;
					full_name?: string | null;
					id?: string;
					is_admin?: boolean | null;
					onboarded?: boolean | null;
					team_id?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "users_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			check_and_notify_rate_limit: {
				Args: { p_project_id: string; p_team_id: string };
				Returns: boolean;
			};
			create_team: {
				Args: { name: string };
				Returns: string;
			};
			get_executions_all: {
				Args: { date_from: string; date_to: string; p_team_id: string };
				Returns: {
					date: string;
					execution_count: number;
				}[];
			};
			get_server_key: {
				Args: { p_provider_key_id: string };
				Returns: string;
			};
			get_team_limits_metrics: {
				Args: { p_team_id: string };
				Returns: {
					api_calls_limit: number;
					api_calls_remaining: number;
					api_calls_used: number;
					projects_count: number;
					projects_limit: number;
				}[];
			};
			get_tokens_all: {
				Args: { date_from: string; date_to: string; p_team_id: string };
				Returns: {
					date: string;
					total_tokens: number;
				}[];
			};
			insert_server_key: {
				Args: { p_key_value: string; p_provider_key_id: string };
				Returns: undefined;
			};
			is_member_of: {
				Args: { _team_id: string; _user_id: string };
				Returns: boolean;
			};
			is_owner_of: {
				Args: { _team_id: string; _user_id: string };
				Returns: boolean;
			};
		};
		Enums: {
			finish_reason:
				| "stop"
				| "length"
				| "content-filter"
				| "tool-calls"
				| "error"
				| "other"
				| "unknown";
			provider_type: "OPENAI" | "ANTHROPIC" | "GOOGLE";
			team_role: "OWNER" | "MEMBER";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			finish_reason: [
				"stop",
				"length",
				"content-filter",
				"tool-calls",
				"error",
				"other",
				"unknown",
			],
			provider_type: ["OPENAI", "ANTHROPIC", "GOOGLE"],
			team_role: ["OWNER", "MEMBER"],
		},
	},
} as const;
