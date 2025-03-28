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
					model: string | null;
					name: string;
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
					model?: string | null;
					name: string;
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
					model?: string | null;
					name?: string;
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
						foreignKeyName: "fk_team";
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
			create_team: {
				Args: {
					name: string;
				};
				Returns: string;
			};
			get_executions_all: {
				Args: {
					p_team_id: string;
					date_from: string;
					date_to: string;
				};
				Returns: {
					date: string;
					execution_count: number;
				}[];
			};
			get_server_key: {
				Args: {
					p_provider_key_id: string;
				};
				Returns: string;
			};
			get_team_limits_metrics: {
				Args: {
					p_team_id: string;
				};
				Returns: {
					projects_limit: number;
					projects_count: number;
					api_calls_limit: number;
					api_calls_used: number;
					api_calls_remaining: number;
				}[];
			};
			insert_server_key: {
				Args: {
					p_provider_key_id: string;
					p_key_value: string;
				};
				Returns: undefined;
			};
			is_member_of: {
				Args: {
					_user_id: string;
					_team_id: string;
				};
				Returns: boolean;
			};
			is_owner_of: {
				Args: {
					_user_id: string;
					_team_id: string;
				};
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
			provider_type: "OPENAI" | "ANTHROPIC";
			team_role: "OWNER" | "MEMBER";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
				PublicSchema["Views"])
		? (PublicSchema["Tables"] &
				PublicSchema["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;
