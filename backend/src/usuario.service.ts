import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  // Validação de senha inspirada no Better Auth
  private validatePassword(password: string): void {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('A senha deve ter pelo menos 6 caracteres');
    }
    
    if (errors.length > 0) {
      throw new Error(`Senha inválida: ${errors.join(', ')}`);
    }
  }

  // Hash de senha com salt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Mais seguro que o padrão
    return bcrypt.hash(password, saltRounds);
  }

  async create(data: any) {
    try {
      // Valida a senha
      this.validatePassword(data.senha);
      
      // Verifica se o email já existe
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }
      
      // Hash da senha
      const hashedPassword = await this.hashPassword(data.senha);
      
      const user = await this.prisma.usuario.create({
        data: {
          ...data,
          senha: hashedPassword,
        },
      });
      
      // Remove a senha do retorno
      const { senha, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async existsAdmin(): Promise<boolean> {
    const adminCount = await this.prisma.usuario.count({
      where: { role: 'Admin' },
    });
    return adminCount > 0;
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        foto: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        foto: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return user;
  }

  async update(id: string, data: any) {
    try {
      // Se está atualizando a senha, valida e faz hash
      if (data.senha) {
        this.validatePassword(data.senha);
        data.senha = await this.hashPassword(data.senha);
      }
      
      const user = await this.prisma.usuario.update({
        where: { id },
        data,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          foto: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.usuario.delete({
        where: { id },
      });
      return { message: 'Usuário excluído com sucesso' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw new Error(`Erro ao excluir usuário: ${error.message}`);
    }
  }
} 